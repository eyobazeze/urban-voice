export interface Staff {
  id: string;
  name: string;
  email: string;
  title: string;
  demo: boolean;
}

export const DEMO_STAFF: Staff = {
  id: "demo-staff", name: "Hanna Bekele", email: "hanna.bekele@city.example", title: "Complaint officer", demo: true,
};
