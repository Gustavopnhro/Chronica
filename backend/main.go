package main

import (
	"encoding/base64"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/jung-kurt/gofpdf"
)

type TimelineEntry struct {
	ID     string   `json:"id"`
	Time   string   `json:"time"`
	Actor  string   `json:"actor"`
	Notes  string   `json:"notes"`
	Images []string `json:"images"` // Base64 encoded images (data URLs)
}

type Action struct {
	Action   string `json:"action"`
	Owner    string `json:"owner"`
	Priority string `json:"priority"`
	Due      string `json:"due"`
	Status   string `json:"status"`
}

type Lessons struct {
	Good    string `json:"good"`
	Improve string `json:"improve"`
}

type Branding struct {
	Logo   string `json:"logo"`   // data URL
	Header string `json:"header"` // data URL
	Footer string `json:"footer"` // data URL
}

type PostmortemData struct {
	Title      string          `json:"title"`
	Date       string          `json:"date"`
	Severity   string          `json:"severity"`
	Owners     string          `json:"owners"`
	Creator    string          `json:"creator"`
	Duration   string          `json:"duration"`
	Affected   string          `json:"affected"`
	Summary    string          `json:"summary"`
	Impact     string          `json:"impact"`
	RootCause  string          `json:"rootCause"`
	Detection  string          `json:"detection"`
	Response   string          `json:"response"`
	Comm       string          `json:"comm"`
	Timeline   []TimelineEntry `json:"timeline"`
	Actions    []Action        `json:"actions"`
	Lessons    Lessons         `json:"lessons"`
	References string          `json:"references"`
	Branding   Branding        `json:"branding"`
	Lang       string          `json:"lang"`
	StartTime  string          `json:"startTime"`
	EndTime    string          `json:"endTime"`
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func sanitizeFilename(name string) string {
	re := regexp.MustCompile(`[^\w\d_-]+`)
	return re.ReplaceAllString(name, "_")
}

func main() {
	_ = godotenv.Load()
	gin.SetMode(os.Getenv("GIN_MODE"))
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := gin.Default()
	router.SetTrustedProxies(nil)
	router.Use(cors.Default())

	fmt.Println("🟡 Waiting for fonts in:", "fonts/DejaVuSans.ttf")
	fmt.Println("🟡 DejaVuSans.ttf?", fileExists("fonts/DejaVuSans.ttf"))
	fmt.Println("🟡 Dejavusans-Bold.ttf?", fileExists("fonts/Dejavusans-Bold.ttf"))

	router.POST("/generate-postmortem-pdf", func(c *gin.Context) {
		var data PostmortemData
		if err := c.ShouldBindJSON(&data); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		start, _ := time.Parse("15:04", data.StartTime)
		end, _ := time.Parse("15:04", data.EndTime)
		duration := end.Sub(start)
		data.Duration = fmt.Sprintf("%.0fh %.0fm", duration.Hours(), duration.Minutes())

		pdf := gofpdf.New("P", "mm", "A4", "")
		topMargin := 30.0
		leftMargin := 15.0
		rightMargin := 15.0
		bottomMargin := 15.0

		pdf.SetMargins(leftMargin, topMargin, rightMargin)
		pdf.SetAutoPageBreak(true, bottomMargin)

		pdf.AddUTF8Font("DejaVu", "", "/fonts/DejaVuSans.ttf")
		pdf.AddUTF8Font("DejaVu", "B", "/fonts/DejaVuSans-Bold.ttf")

		headerImgPath, _ := decodeDataURLToTempImageAndMeasure(pdf, data.Branding.Header, usableWidth(pdf, leftMargin, rightMargin))
		footerImgPath, footerH := decodeDataURLToTempImageAndMeasure(pdf, data.Branding.Footer, usableWidth(pdf, leftMargin, rightMargin))
		logoImgPath, _ := decodeDataURLToTempImageAndMeasure(pdf, data.Branding.Logo, usableWidth(pdf, leftMargin, rightMargin))

		if footerImgPath != "" {
			pdf.SetAutoPageBreak(true, bottomMargin+footerH+5)
		}

		pdf.SetHeaderFuncMode(func() {
			if pdf.PageNo() == 1 || headerImgPath == "" {
				return
			}

			info := pdf.RegisterImage(headerImgPath, "")
			iw, ih := info.Extent() // dimensões originais da imagem

			// Pega tamanho da página completo (não apenas área útil)
			pageW, _ := pdf.GetPageSize()

			// Calcula altura proporcional à largura total da página
			scale := pageW / iw
			hScaled := ih * scale

			// Renderiza a imagem ocupando 100% da largura da página
			pdf.ImageOptions(headerImgPath, 0, 0, pageW, 0, false, gofpdf.ImageOptions{}, 0, "")

			// Ajusta a margem superior pra não sobrepor o texto
			pdf.SetTopMargin(hScaled + 10)
		}, true)

		pdf.SetFooterFunc(func() {
			if pdf.PageNo() == 1 || footerImgPath == "" {
				return
			}

			pageW, pageH := pdf.GetPageSize()

			// Detecta dimensões originais da imagem
			info := pdf.RegisterImage(footerImgPath, "")
			iw, ih := info.Extent()

			// Calcula escala proporcional à largura total da página
			scale := pageW / iw
			hScaled := ih * scale

			// Desenha imagem ocupando 100% da largura
			y := pageH - hScaled
			pdf.ImageOptions(footerImgPath, 0, y, pageW, 0, false, gofpdf.ImageOptions{}, 0, "")

			// Número da página centralizado logo abaixo
			pdf.SetY(pageH - 10)
			pdf.SetFont("DejaVu", "", 9)
			pdf.CellFormat(pageW, 5, fmt.Sprintf("Page %d", pdf.PageNo()), "", 0, "C", false, 0, "")
		})
		// Cover Page
		pdf.AddPage()
		if logoImgPath != "" {
			pageW, pageH := pdf.GetPageSize()
			logoW := pageW * 0.35
			x := (pageW - logoW) / 2
			y := pageH * 0.25
			pdf.ImageOptions(logoImgPath, x, y, logoW, 0, false, gofpdf.ImageOptions{}, 0, "")
		}

		// ====== CAPA ======
		pdf.SetY(pdf.GetY() + 80)
		pdf.SetFont("DejaVu", "B", 20)
		pdf.MultiCell(0, 10, data.Title, "", "C", false)
		pdf.Ln(10)

		pdf.SetFont("DejaVu", "", 10)
		pdf.MultiCell(0, 8,
			fmt.Sprintf("%s - %s",
				tr(data.Lang, "Post-Incident Report"),
				formatDate(data.Date, data.Lang),
			),
			"", "C", false,
		)
		pdf.MultiCell(0, 8,
			fmt.Sprintf("%s: %s",
				tr(data.Lang, "Severity"),
				formatSeverity(data.Severity, data.Lang),
			),
			"", "C", false,
		)
		pdf.MultiCell(0, 8,
			fmt.Sprintf("%s: %s",
				tr(data.Lang, "Creator"),
				data.Creator,
			),
			"", "C", false,
		)
		pdf.Ln(20)

		// ====== PÓS-CAPA: RESUMO DO INCIDENTE =====
		pdf.AddPage()
		// === VISÃO GERAL DO INCIDENTE (azul forte com texto branco) ===
		pdf.SetFont("DejaVu", "B", 18)
		pdf.CellFormat(0, 12, tr(data.Lang, "Incident Overview"), "", 1, "C", false, 0, "")
		pdf.Ln(10)

		pdf.SetFont("DejaVu", "", 11)
		pdf.SetLineWidth(0.3)

		xStart := 20.0
		yStart := pdf.GetY()
		colGap := 25.0
		colWidth := 85.0
		rowH := 9.0

		// Cores
		headerBlue := struct{ R, G, B int }{R: 0, G: 75, B: 141} // Azul forte
		pdf.SetDrawColor(180, 180, 180)

		// Função pra desenhar uma linha (rótulo azul, valor branco)
		drawRow := func(x, y float64, label, value string) {
			labelW := 45.0
			valueW := colWidth - labelW

			// rótulo azul forte
			pdf.SetFillColor(headerBlue.R, headerBlue.G, headerBlue.B)
			pdf.SetTextColor(255, 255, 255)
			pdf.RoundedRect(x, y, labelW, rowH, 0, "1234", "DF")
			pdf.SetXY(x+3, y+2)
			pdf.SetFont("DejaVu", "B", 10)
			pdf.CellFormat(labelW-6, 5, label, "", 0, "L", false, 0, "")

			// valor branco
			pdf.SetFillColor(255, 255, 255)
			pdf.SetTextColor(0, 0, 0)
			pdf.Rect(x+labelW, y, valueW, rowH, "D")
			pdf.SetXY(x+labelW+3, y+2)
			pdf.SetFont("DejaVu", "", 10)
			pdf.CellFormat(valueW-6, 5, value, "", 0, "L", false, 0, "")
		}

		// Coluna 1
		col1X := xStart
		col1Y := yStart
		drawRow(col1X, col1Y, tr(data.Lang, "Date (start)"), formatDate(data.Date, data.Lang))
		drawRow(col1X, col1Y+rowH, tr(data.Lang, "Severity"), formatSeverity(data.Severity, data.Lang))
		drawRow(col1X, col1Y+(rowH*2), tr(data.Lang, "Duration"), data.Duration)

		// Coluna 2
		col2X := xStart + colWidth + colGap
		col2Y := yStart
		drawRow(col2X, col2Y, tr(data.Lang, "Start"), data.StartTime)
		drawRow(col2X, col2Y+rowH, tr(data.Lang, "End"), data.EndTime)

		// Avança o cursor
		pdf.SetY(yStart + (rowH * 3) + 10)
		pdf.MultiCell(0, 6, fmt.Sprintf("%s %s", tr(data.Lang, "Owners:"), data.Owners), "", "", false)
		pdf.Ln(10)

		pdf.SetDrawColor(160, 160, 160)
		pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
		pdf.Ln(8)

		if data.Summary != "" {
			addSection(pdf, tr(data.Lang, "Executive Summary"), data.Summary)
		}
		if data.Impact != "" {
			addSection(pdf, tr(data.Lang, "Customer Impact"), data.Impact)
		}

		pdf.SetDrawColor(160, 160, 160)
		pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
		pdf.Ln(8)

		addSection(pdf, "", tr(data.Lang, "This report documents the incident occurrence, impact, response, and continuous improvement actions."))

		// if logoImgPath != "" {
		// 	left, _, right, _ := pdf.GetMargins()
		// 	pageW, _ := pdf.GetPageSize()
		// 	w := pageW - left - right
		// 	logoW := w * 0.4
		// 	x := (pageW - logoW) / 2
		// 	y := pdf.GetY()
		// 	pdf.Image(logoImgPath, x, y, logoW, 0, false, "", 0, "")
		// 	pdf.Ln(logoW*0.4 + 10)
		// }
		pdf.AddPage()

		pdf.SetFont("DejaVu", "B", 22)
		pdf.MultiCell(0, 10, data.Title, "", "C", false)
		pdf.Ln(15)

		pdf.SetFont("DejaVu", "B", 14)
		pdf.Cell(0, 10, tr(data.Lang, "Incident Details"))
		pdf.Ln(10)

		pdf.SetFont("DejaVu", "", 10)
		pdf.MultiCell(0, 7, fmt.Sprintf("%s %s", tr(data.Lang, "Owners:"), data.Owners), "", "", false)
		pdf.MultiCell(0, 7, fmt.Sprintf("%s %s", tr(data.Lang, "Affected Systems:"), data.Affected), "", "", false)
		pdf.Ln(10)

		pdf.SetFont("DejaVu", "B", 14)
		pdf.Cell(0, 10, tr(data.Lang, "Technical Problems"))
		pdf.Ln(10)

		pdf.SetFont("DejaVu", "", 10)
		pdf.MultiCell(0, 7, data.RootCause, "", "", false)
		pdf.Ln(10)

		// Dynamic Sections

		if data.RootCause != "" {
			addSection(pdf, tr(data.Lang, "Root Cause"), data.RootCause)
		}
		if data.Detection != "" {
			addSection(pdf, tr(data.Lang, "Detection"), data.Detection)
		}
		if data.Response != "" {
			addSection(pdf, tr(data.Lang, "Incident Response"), data.Response)
		}
		if data.Comm != "" {
			addSection(pdf, tr(data.Lang, "Communications"), data.Comm)
		}

		// Timeline
		// ==== TIMELINE ESTILIZADA (sem boxes, hierarquia visual limpa) ====
		if len(data.Timeline) > 0 {
			pdf.SetFont("DejaVu", "B", 14)
			pdf.CellFormat(0, 10, tr(data.Lang, "Timeline"), "", 1, "C", false, 0, "")
			pdf.Ln(4)

			lineColor := struct{ R, G, B int }{R: 0, G: 71, B: 133} // Azul
			pdf.SetDrawColor(lineColor.R, lineColor.G, lineColor.B)
			pdf.SetLineWidth(0.3)

			for i, entry := range data.Timeline {
				// Linha separadora (menos na primeira)
				if i > 0 {
					pdf.SetDrawColor(200, 200, 200)
					pdf.Line(20, pdf.GetY(), 190, pdf.GetY())
					pdf.Ln(4)
				}

				// Cabeçalho do evento
				pdf.SetFont("DejaVu", "B", 11)
				pdf.SetTextColor(lineColor.R, lineColor.G, lineColor.B)
				pdf.CellFormat(0, 6, fmt.Sprintf(" %s  |  %s %s", entry.Time, tr(data.Lang, "Actor:"), entry.Actor), "", 1, "L", false, 0, "")
				pdf.SetTextColor(0, 0, 0)

				// Notas
				pdf.SetFont("DejaVu", "", 10)
				pdf.MultiCell(0, 6, fmt.Sprintf("%s %s", tr(data.Lang, "Notes:"), entry.Notes), "", "", false)
				pdf.Ln(3)

				// Inserir imagens (se houver)
				for _, imgBase64 := range entry.Images {
					tmpfile := decodeDataURLToTempImage(imgBase64)
					if tmpfile == "" {
						continue
					}
					defer os.Remove(tmpfile)

					imgWpx, imgHpx := getImageDimensions(tmpfile)
					if imgWpx == 0 || imgHpx == 0 {
						continue
					}

					pageW, _ := pdf.GetPageSize()
					margin := 20.0
					maxW := pageW - margin*2
					scale := maxW / imgWpx
					scaledH := imgHpx * scale

					pdf.Image(tmpfile, margin, pdf.GetY(), maxW, 0, false, "", 0, "")
					pdf.Ln(scaledH + 5)
				}
			}
			pdf.Ln(8)
		}

		// ==== AÇÕES CORRETIVAS E PREVENTIVAS (CAPA) ====
		if len(data.Actions) > 0 {
			pdf.SetFont("DejaVu", "B", 14)
			pdf.CellFormat(0, 10, tr(data.Lang, "Corrective & Preventive Actions (CAPA)"), "", 1, "C", true, 0, "")
			pdf.Ln(5)

			lineColor := struct{ R, G, B int }{R: 0, G: 71, B: 133} // Azul
			pdf.SetLineWidth(0.3)

			for i, action := range data.Actions {
				// Cabeçalho da ação
				pdf.SetFont("DejaVu", "B", 11)
				pdf.SetTextColor(lineColor.R, lineColor.G, lineColor.B)
				pdf.MultiCell(0, 6, fmt.Sprintf("%s %d: %s", tr(data.Lang, "Action"), i+1, action.Action), "", "L", false)

				// Metadados
				pdf.SetFont("DejaVu", "", 10)
				pdf.SetTextColor(0, 0, 0)
				pdf.CellFormat(0, 6, fmt.Sprintf("%s: %s", tr(data.Lang, "Status"), action.Status), "", 1, "L", false, 0, "")
				pdf.CellFormat(0, 6, fmt.Sprintf("%s: %s", tr(data.Lang, "Owner"), action.Owner), "", 1, "L", false, 0, "")
				pdf.CellFormat(0, 6, fmt.Sprintf("%s: %s", tr(data.Lang, "Due Date"), formatDate(action.Due, data.Lang)), "", 1, "L", false, 0, "")
				pdf.Ln(3)

				// Linha divisória entre ações
				pdf.SetDrawColor(200, 200, 200)
				pdf.Line(20, pdf.GetY(), 190, pdf.GetY())
				pdf.Ln(5)
			}
			pdf.Ln(5)
		}

		// Lessons Learned
		if data.Lessons.Good != "" || data.Lessons.Improve != "" {
			pdf.SetFont("DejaVu", "B", 14)
			pdf.CellFormat(0, 10, tr(data.Lang, "Lessons Learned"), "", 1, "C", true, 0, "")

			pdf.Ln(10)

			if data.Lessons.Good != "" {
				pdf.SetFont("DejaVu", "B", 12)
				pdf.Cell(0, 7, tr(data.Lang, "What went well:"))
				pdf.Ln(7)
				pdf.SetFont("DejaVu", "", 10)
				pdf.MultiCell(0, 7, data.Lessons.Good, "", "", false)
				pdf.Ln(5)
			}

			if data.Lessons.Improve != "" {
				pdf.SetFont("DejaVu", "B", 12)
				pdf.Cell(0, 7, tr(data.Lang, "What to improve:"))
				pdf.Ln(7)
				pdf.SetFont("DejaVu", "", 10)
				pdf.MultiCell(0, 7, data.Lessons.Improve, "", "", false)
				pdf.Ln(10)
			}
		}

		safeTitle := sanitizeFilename(data.Title)
		if safeTitle == "" {
			safeTitle = "incident-report"
		}

		tmpFile, err := ioutil.TempFile("", "postmortem-*.pdf")
		if err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("Erro criando arquivo temporário: %s", err))
			return
		}
		pdfFileName := tmpFile.Name()
		tmpFile.Close()

		defer os.Remove(pdfFileName)

		if err := pdf.OutputFileAndClose(pdfFileName); err != nil {
			c.String(http.StatusInternalServerError, fmt.Sprintf("Error generating PDF: %s", err))
			return
		}

		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s.pdf\"", safeTitle))
		c.File(pdfFileName)
	})

	router.Run(":" + port)
}

func addSection(pdf *gofpdf.Fpdf, title, content string) {
	pdf.SetFont("DejaVu", "B", 14)
	pdf.Cell(0, 10, title)
	pdf.Ln(10)
	pdf.SetFont("DejaVu", "", 10)
	pdf.MultiCell(0, 7, content, "", "", false)
	pdf.Ln(10)
}

func renderActionsTable(pdf *gofpdf.Fpdf, actions []Action, lang string) {
	pdf.SetFont("DejaVu", "", 10)
	if len(actions) == 0 {
		pdf.MultiCell(0, 7, "No actions recorded.", "", "", false)
		return
	}
	left, _, right, _ := pdf.GetMargins()
	pageW, _ := pdf.GetPageSize()
	usableW := pageW - left - right
	ratios := []float64{0.40, 0.18, 0.12, 0.15, 0.15} // Action, Owner, Priority, Due, Status
	widths := make([]float64, len(ratios))
	for i, r := range ratios {
		widths[i] = r * usableW
	}
	header := []string{tr(lang, "Action"), tr(lang, "Owner"), tr(lang, "Priority"), tr(lang, "Due"), tr(lang, "Status")}
	renderTableHeader(pdf, header, widths, lang)
	for _, a := range actions {
		cells := []string{a.Action, a.Owner, a.Priority, a.Due, a.Status}
		renderTableRow(pdf, cells, widths, lang)
	}
}

func renderTableHeader(pdf *gofpdf.Fpdf, header []string, widths []float64, lang string) {
	pdf.SetFont("DejaVu", "B", 10)
	h := 8.0
	x := pdf.GetX()
	y := pdf.GetY()
	_, pageH := pdf.GetPageSize()
	_, _, _, bottom := pdf.GetMargins()
	if y+h > pageH-bottom {
		pdf.AddPage()
		x = pdf.GetX()
		y = pdf.GetY()
	}
	for i, text := range header {
		pdf.Rect(x, y, widths[i], h, "")
		pdf.CellFormat(widths[i], h, text, "", 0, "C", false, 0, "")
		x += widths[i]
	}
	pdf.Ln(h)
	pdf.SetFont("DejaVu", "", 10)
}

func renderTableRow(pdf *gofpdf.Fpdf, cells []string, widths []float64, lang string) {
	lineH := 6.0
	maxLines := 1
	for i, txt := range cells {
		lines := pdf.SplitLines([]byte(txt), widths[i]-2) // padding 1mm de cada lado
		if len(lines) > maxLines {
			maxLines = len(lines)
		}
	}
	rowH := float64(maxLines) * lineH

	y := pdf.GetY()
	_, pageH := pdf.GetPageSize()
	_, _, _, bottom := pdf.GetMargins()
	if y+rowH > pageH-bottom {
		pdf.AddPage()
		header := []string{tr(lang, "Action"), tr(lang, "Owner"), tr(lang, "Priority"), tr(lang, "Due"), tr(lang, "Status")}
		renderTableHeader(pdf, header, widths, lang)
	}

	startX := pdf.GetX()
	startY := pdf.GetY()
	for i, txt := range cells {
		pdf.Rect(startX, startY, widths[i], rowH, "")
		pdf.SetXY(startX+1, startY+1)
		pdf.MultiCell(widths[i]-2, lineH, txt, "", "L", false)
		startX += widths[i]
		pdf.SetXY(startX, startY)
	}
	pdf.Ln(rowH)
}

func getImageDimensions(imagePath string) (float64, float64) {
	file, err := os.Open(imagePath)
	if err != nil {
		return 0, 0
	}
	defer file.Close()

	img, _, err := image.DecodeConfig(file)
	if err != nil {
		return 0, 0
	}
	return float64(img.Width), float64(img.Height)
}

// decodeDataURLToTempImage decodes a data URL and writes it to a temp file with the correct extension.
func decodeDataURLToTempImage(dataURL string) string {
	if dataURL == "" {
		return ""
	}

	parts := strings.Split(dataURL, ",")
	if len(parts) != 2 {
		return "" // Invalid data URL format
	}

	// Extract MIME type, e.g., "data:image/png;base64" -> "image/png"
	mimePart := strings.Split(parts[0], ";")[0]
	mimeType := strings.TrimPrefix(mimePart, "data:")

	// Determine file extension
	var extension string
	switch mimeType {
	case "image/png":
		extension = ".png"
	case "image/jpeg":
		extension = ".jpg"
	case "image/gif":
		extension = ".gif"
	default:
		return "" // Unsupported image type
	}

	decoded, err := base64.StdEncoding.DecodeString(parts[1])
	if err != nil {
		return ""
	}

	// Create a temp file with the correct extension
	tmpfile, err := ioutil.TempFile("", "upload-*"+extension)
	if err != nil {
		return ""
	}
	defer tmpfile.Close()

	if _, err := tmpfile.Write(decoded); err != nil {
		return ""
	}

	return tmpfile.Name()
}

// decodeDataURLToTempImageAndMeasure decodes a data URL image, stores it in a temp file,
// and returns its temp path and the height (in mm) when scaled to targetWidth (in mm).
func decodeDataURLToTempImageAndMeasure(pdf *gofpdf.Fpdf, dataURL string, targetWidth float64) (string, float64) {
	path := decodeDataURLToTempImage(dataURL)
	if path == "" {
		return "", 0
	}
	wpx, hpx := getImageDimensions(path)
	if wpx == 0 || hpx == 0 {
		return path, 0
	}
	scale := targetWidth / wpx
	return path, hpx * scale
}

func usableWidth(pdf *gofpdf.Fpdf, left, right float64) float64 {
	pageW, _ := pdf.GetPageSize()
	return pageW - left - right
}

func tr(lang, key string) string {
	if translations[lang] != nil && translations[lang][key] != "" {
		return translations[lang][key]
	}
	return key // fallback
}

func formatSeverity(sev, lang string) string {
	sev = strings.ToUpper(strings.TrimSpace(sev))
	if lang == "pt" {
		switch sev {
		case "SEV-1":
			return "SEV-1 (Crítico)"
		case "SEV-2":
			return "SEV-2 (Alto)"
		case "SEV-3":
			return "SEV-3 (Moderado)"
		case "SEV-4":
			return "SEV-4 (Baixo)"
		default:
			return sev
		}
	} else {
		switch sev {
		case "SEV-1":
			return "SEV-1 (Critical)"
		case "SEV-2":
			return "SEV-2 (High)"
		case "SEV-3":
			return "SEV-3 (Moderate)"
		case "SEV-4":
			return "SEV-4 (Low)"
		default:
			return sev
		}
	}
}

// Formata data conforme idioma
func formatDate(dateStr, lang string) string {
	parsed, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return dateStr
	}
	if lang == "pt" {
		return parsed.Format("02/01/2006")
	}
	return parsed.Format("2006-01-02")
}
