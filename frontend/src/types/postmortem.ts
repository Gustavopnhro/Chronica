export interface TimelineEntry {
  id: string;
  time: string;
  actor: string;
  notes: string;
  images: string[];
}

export interface Action {
  action: string;
  owner: string;
  priority: 'P1' | 'P2' | 'P3';
  due: string;
  status: 'Open' | 'In Progress' | 'Blocked' | 'Done';
}

export interface Branding {
  logo: string;
  header: string;
  footer: string;
}

export interface PostmortemState {
  title: string;
  creator: string;
  date: string;
  severity: 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';
  owners: string;
  duration: string;
  affected: string;
  summary: string;
  impact: string;
  rootCause: string;
  detection: string;
  response: string;
  comm: string;
  timeline: TimelineEntry[];
  actions: Action[];
  lessons: {
    good: string;
    improve: string;
  };
  references: string;
  branding: Branding;
  lang: 'pt' | 'en';
}
