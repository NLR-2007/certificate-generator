export interface Participant {
  id: string;
  registration_id: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  college?: string;
  event_name: string;
  team_name?: string;
  eligible: boolean;
  certificate_generated: boolean;
  certificate_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CertificateRecord {
  id?: string;
  certificate_id: string;
  participant_id?: string;
  participant_name: string;
  registration_id: string;
  event_name: string;
  issue_date: string;
  template_id?: string;
  verification_token?: string;
  pdf_url?: string;
  status: 'VALID' | 'REVOKED' | 'EXPIRED';
  created_at?: string;
}

export type Certificate = CertificateRecord;

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "email" | "tel" | "select" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormConfig {
  title: string;
  description: string;
  fields: FormField[];
}

export interface FormSubmission {
  id: string;
  submitted_at: string;
  data: Record<string, string>;
}

export const DEFAULT_FORM_CONFIG: FormConfig = {
  title: "Hackathon Registration Form",
  description: "Fill out your details to enter upcoming Hackathons & Sprints at KLH Bachupally.",
  fields: [
    { id: "name", label: "Full Name (As per College Records)", type: "text", required: true, placeholder: "e.g. MARRI HRUTHIKA" },
    { id: "registration_id", label: "Roll Number / Reg ID", type: "text", required: true, placeholder: "e.g. 2520090002" },
    { id: "email", label: "Student Email Address", type: "email", required: true, placeholder: "e.g. student@klh.edu.in" },
    { id: "phone", label: "WhatsApp Contact Number", type: "tel", required: true, placeholder: "e.g. +91 98765 43210" },
    {
      id: "department",
      label: "Department / Campus",
      type: "select",
      required: true,
      options: ["Computer Science & Engineering (CSE)", "Artificial Intelligence & Data Science (AI&DS)", "Electronics & Communication (ECE)", "Computer Science & IT (CS&IT)", "Mechanical & Robotics"]
    },
    { id: "team_name", label: "Hackathon Team Name", type: "text", required: true, placeholder: "e.g. Black Panthers / Innovators 2026" },
    {
      id: "team_role",
      label: "Team Role",
      type: "select",
      required: true,
      options: ["Team Leader", "Team Member", "Individual Participant"]
    },
    { id: "project_title", label: "Proposed Project Title / Idea", type: "textarea", required: false, placeholder: "Briefly describe your project idea..." },
  ]
};

export const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 'p-2520090002', registration_id: '2520090002', name: 'Marri Hruthika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'InnoTech', eligible: true, certificate_generated: false },
  { id: 'p-2520080010', registration_id: '2520080010', name: 'K.Gayathri Srivalli', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'InnoTech', eligible: true, certificate_generated: false },
  { id: 'p-2520090093', registration_id: '2520090093', name: 'A.Yuktha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'InnoTech', eligible: true, certificate_generated: false },
  { id: 'p-2520030151', registration_id: '2520030151', name: 'Madhulika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'InnoTech', eligible: true, certificate_generated: false },
  { id: 'p-2520030566', registration_id: '2520030566', name: 'Srihitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'InnoTech', eligible: true, certificate_generated: false },
  { id: 'p-2520090164', registration_id: '2520090164', name: 'Srikar', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innov8', eligible: true, certificate_generated: false },
  { id: 'p-2520030460', registration_id: '2520030460', name: 'K.Poojitha Rani', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innov8', eligible: true, certificate_generated: false },
  { id: 'p-2520030058', registration_id: '2520030058', name: 'Navaneeth', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innov8', eligible: true, certificate_generated: false },
  { id: 'p-2520030215', registration_id: '2520030215', name: 'Gireesh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innov8', eligible: true, certificate_generated: false },
  { id: 'p-2520030317', registration_id: '2520030317', name: 'Himesh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innov8', eligible: true, certificate_generated: false },
  { id: 'p-2520040032', registration_id: '2520040032', name: 'Dhanush Karthikeya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innov8', eligible: true, certificate_generated: false },
  { id: 'p-2520030230', registration_id: '2520030230', name: 'K.Hemanth', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Tech-Explorers', eligible: true, certificate_generated: false },
  { id: 'p-2520030126', registration_id: '2520030126', name: 'D. Siri Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Tech-Explorers', eligible: true, certificate_generated: false },
  { id: 'p-2520030299', registration_id: '2520030299', name: 'Shaila Bhanu', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Tech-Explorers', eligible: true, certificate_generated: false },
  { id: 'p-2520030170', registration_id: '2520030170', name: 'S.Abhiram Rao', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Tech-Explorers', eligible: true, certificate_generated: false },
  { id: 'p-2520040082', registration_id: '2520040082', name: 'D.Karthik', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Tech-Explorers', eligible: true, certificate_generated: false },
  { id: 'p-2520040004', registration_id: '2520040004', name: 'S.Karthikeya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Tech-Explorers', eligible: true, certificate_generated: false },
  { id: 'p-2520090040', registration_id: '2520090040', name: 'PAVANI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CodeSix', eligible: true, certificate_generated: false },
  { id: 'p-2520030254', registration_id: '2520030254', name: 'Simi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CodeSix', eligible: true, certificate_generated: false },
  { id: 'p-2520030069', registration_id: '2520030069', name: 'Hemaswi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CodeSix', eligible: true, certificate_generated: false },
  { id: 'p-2520030091', registration_id: '2520030091', name: 'Rupesh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CodeSix', eligible: true, certificate_generated: false },
  { id: 'p-2520030310', registration_id: '2520030310', name: 'Yuvan', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CodeSix', eligible: true, certificate_generated: false },
  { id: 'p-2520030604', registration_id: '2520030604', name: 'Dhanvin gupta', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'VMAx', eligible: true, certificate_generated: false },
  { id: 'p-2520080030', registration_id: '2520080030', name: 'Mahathi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'VMAx', eligible: true, certificate_generated: false },
  { id: 'p-2520030050', registration_id: '2520030050', name: 'Pranavi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'VMAx', eligible: true, certificate_generated: false },
  { id: 'p-2520030389', registration_id: '2520030389', name: 'Sohith Veldi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'VMAx', eligible: true, certificate_generated: false },
  { id: 'p-2520030194', registration_id: '2520030194', name: 'Yeshvitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'VMAx', eligible: true, certificate_generated: false },
  { id: 'p-2520030036', registration_id: '2520030036', name: 'Yashwanth Sai', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'VMAx', eligible: true, certificate_generated: false },
  { id: 'p-2520030246', registration_id: '2520030246', name: 'Sangu Nikhil', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Quantum Crew', eligible: true, certificate_generated: false },
  { id: 'p-2520040001', registration_id: '2520040001', name: 'Thadamalla Sharon Rhoda', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Quantum Crew', eligible: true, certificate_generated: false },
  { id: 'p-2520030522', registration_id: '2520030522', name: 'V. Sai Chandu', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Quantum Crew', eligible: true, certificate_generated: false },
  { id: 'p-2520030102', registration_id: '2520030102', name: 'T. Hasini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Quantum Crew', eligible: true, certificate_generated: false },
  { id: 'p-2520040049', registration_id: '2520040049', name: 'J. Krishna Chaithanya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Quantum Crew', eligible: true, certificate_generated: false },
  { id: 'p-2520040101', registration_id: '2520040101', name: 'M. Surarichita Laxmi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Quantum Crew', eligible: true, certificate_generated: false },
  { id: 'p-2520030079', registration_id: '2520030079', name: 'M.Keerthi Sri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'KshetraX', eligible: true, certificate_generated: false },
  { id: 'p-2520030567', registration_id: '2520030567', name: 'Y.Jahnavi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'KshetraX', eligible: true, certificate_generated: false },
  { id: 'p-2520030080', registration_id: '2520030080', name: 'N.Greeshma', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'KshetraX', eligible: true, certificate_generated: false },
  { id: 'p-2520030450', registration_id: '2520030450', name: 'P.Venkat', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'KshetraX', eligible: true, certificate_generated: false },
  { id: 'p-2520030231', registration_id: '2520030231', name: 'K.Girish', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'KshetraX', eligible: true, certificate_generated: false },
  { id: 'p-2520090105', registration_id: '2520090105', name: 'T.Lokesh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'KshetraX', eligible: true, certificate_generated: false },
  { id: 'p-2520040094', registration_id: '2520040094', name: 'Karthika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Sparknova', eligible: true, certificate_generated: false },
  { id: 'p-2520030045', registration_id: '2520030045', name: 'Samshritha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Sparknova', eligible: true, certificate_generated: false },
  { id: 'p-2520040063', registration_id: '2520040063', name: 'Shreya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Sparknova', eligible: true, certificate_generated: false },
  { id: 'p-2520030093', registration_id: '2520030093', name: 'K Charan', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Sparknova', eligible: true, certificate_generated: false },
  { id: 'p-2520030313', registration_id: '2520030313', name: 'N Nishanth', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Sparknova', eligible: true, certificate_generated: false },
  { id: 'p-2520030264', registration_id: '2520030264', name: 'Laxmi sri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Sparknova', eligible: true, certificate_generated: false },
  { id: 'p-2520090206', registration_id: '2520090206', name: 'Karnati LaxmiLahari', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Crack Hack', eligible: true, certificate_generated: false },
  { id: 'p-2520090205', registration_id: '2520090205', name: 'A.Jhansi Priya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Crack Hack', eligible: true, certificate_generated: false },
  { id: 'p-2520090177', registration_id: '2520090177', name: 'Keerthi Priya Ande', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Crack Hack', eligible: true, certificate_generated: false },
  { id: 'p-2520090174', registration_id: '2520090174', name: 'S.Rishil', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Crack Hack', eligible: true, certificate_generated: false },
  { id: 'p-2520030386', registration_id: '2520030386', name: 'T.Jashwanth Ram Chowdary', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Crack Hack', eligible: true, certificate_generated: false },
  { id: 'p-2520090082', registration_id: '2520090082', name: 'S.Anjani Shreyaj', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Crack Hack', eligible: true, certificate_generated: false },
  { id: 'p-2520030134', registration_id: '2520030134', name: 'KRISH SUREJA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: '6 SENSES', eligible: true, certificate_generated: false },
  { id: 'p-2520030187', registration_id: '2520030187', name: 'Harshit Sajjanapu', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: '6 SENSES', eligible: true, certificate_generated: false },
  { id: 'p-2520030181', registration_id: '2520030181', name: 'M. Yashwant Raj', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: '6 SENSES', eligible: true, certificate_generated: false },
  { id: 'p-2520030171', registration_id: '2520030171', name: 'Anuradha Nandini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: '6 SENSES', eligible: true, certificate_generated: false },
  { id: 'p-2520030205', registration_id: '2520030205', name: 'Deepsikha Biswal', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: '6 SENSES', eligible: true, certificate_generated: false },
  { id: 'p-2520080026', registration_id: '2520080026', name: 'Shivam Tiwari', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: '6 SENSES', eligible: true, certificate_generated: false },
  { id: 'p-2520040061', registration_id: '2520040061', name: 'Aditya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Hexabyte', eligible: true, certificate_generated: false },
  { id: 'p-2520030444', registration_id: '2520030444', name: 'Surya Prakasika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Hexabyte', eligible: true, certificate_generated: false },
  { id: 'p-2520090224', registration_id: '2520090224', name: 'Shanthi Swaroop', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Hexabyte', eligible: true, certificate_generated: false },
  { id: 'p-2520040031', registration_id: '2520040031', name: 'Kushal kumar', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Hexabyte', eligible: true, certificate_generated: false },
  { id: 'p-2520030044', registration_id: '2520030044', name: 'Asthra', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Hexabyte', eligible: true, certificate_generated: false },
  { id: 'p-2520040018', registration_id: '2520040018', name: 'Sai Pavan Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Hexabyte', eligible: true, certificate_generated: false },
  { id: 'p-2520090041', registration_id: '2520090041', name: 'Pavani', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'codeSIX', eligible: true, certificate_generated: false },
  { id: 'p-2520030506', registration_id: '2520030506', name: 'Yashwanth Yalamanchili', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TransitXCDM', eligible: true, certificate_generated: false },
  { id: 'p-2520030136', registration_id: '2520030136', name: 'P. Pranaw Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TransitXCDM', eligible: true, certificate_generated: false },
  { id: 'p-2520030092', registration_id: '2520030092', name: 'G. Keerthi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TransitXCDM', eligible: true, certificate_generated: false },
  { id: 'p-2520030229', registration_id: '2520030229', name: 'K. Sanjana', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TransitXCDM', eligible: true, certificate_generated: false },
  { id: 'p-2520030123', registration_id: '2520030123', name: 'Polisetty Sreeharsha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Brand New Day', eligible: true, certificate_generated: false },
  { id: 'p-2520030203', registration_id: '2520030203', name: 'Harivikas Katta', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Brand New Day', eligible: true, certificate_generated: false },
  { id: 'p-2520030359', registration_id: '2520030359', name: 'Mohammed Faizaan', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Brand New Day', eligible: true, certificate_generated: false },
  { id: 'p-2520030267', registration_id: '2520030267', name: 'Ishaan', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Brand New Day', eligible: true, certificate_generated: false },
  { id: 'p-2520030174', registration_id: '2520030174', name: 'NehaSree', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Brand New Day', eligible: true, certificate_generated: false },
  { id: 'p-2520090007', registration_id: '2520090007', name: 'Dikishita', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Brand New Day', eligible: true, certificate_generated: false },
  { id: 'p-2520030296', registration_id: '2520030296', name: 'Mythri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Error 404', eligible: true, certificate_generated: false },
  { id: 'p-2520030115', registration_id: '2520030115', name: 'Dhana Sri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Error 404', eligible: true, certificate_generated: false },
  { id: 'p-2520030116', registration_id: '2520030116', name: 'Sai Sri Hasini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Error 404', eligible: true, certificate_generated: false },
  { id: 'p-2520030289', registration_id: '2520030289', name: 'Darahasini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Error 404', eligible: true, certificate_generated: false },
  { id: 'p-2520030332', registration_id: '2520030332', name: 'Hansita', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Error 404', eligible: true, certificate_generated: false },
  { id: 'p-2520090161', registration_id: '2520090161', name: 'Koumudi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Error 404', eligible: true, certificate_generated: false },
  { id: 'p-2520030515', registration_id: '2520030515', name: 'D Moksha Siva Sai', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Gryffindoe', eligible: true, certificate_generated: false },
  { id: 'p-2520040092', registration_id: '2520040092', name: 'Atluri Sailesh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Gryffindoe', eligible: true, certificate_generated: false },
  { id: 'p-2520030610', registration_id: '2520030610', name: 'K Siva Sai Krishna', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Gryffindoe', eligible: true, certificate_generated: false },
  { id: 'p-2520090228', registration_id: '2520090228', name: 'R Hema Maniknata Kumar Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Gryffindoe', eligible: true, certificate_generated: false },
  { id: 'p-2520040112', registration_id: '2520040112', name: 'G Mahati Sankar', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Gryffindoe', eligible: true, certificate_generated: false },
  { id: 'p-2520090143', registration_id: '2520090143', name: 'Kavya Sree Aluru', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Gryffindoe', eligible: true, certificate_generated: false },
  { id: 'p-2520040075', registration_id: '2520040075', name: 'D.Sravya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Skill Sync', eligible: true, certificate_generated: false },
  { id: 'p-2520040107', registration_id: '2520040107', name: 'Uditha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Skill Sync', eligible: true, certificate_generated: false },
  { id: 'p-2520040065', registration_id: '2520040065', name: 'Harshini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Skill Sync', eligible: true, certificate_generated: false },
  { id: 'p-2520040045', registration_id: '2520040045', name: 'P.Mohan', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Skill Sync', eligible: true, certificate_generated: false },
  { id: 'p-2520090075', registration_id: '2520090075', name: 'B SAI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Skill Sync', eligible: true, certificate_generated: false },
  { id: 'p-2520030039', registration_id: '2520030039', name: 'T. S. S. S. Ananya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vitae Guardians', eligible: true, certificate_generated: false },
  { id: 'p-2520080013', registration_id: '2520080013', name: 'D Sri Varshini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vitae Guardians', eligible: true, certificate_generated: false },
  { id: 'p-2520030155', registration_id: '2520030155', name: 'Fathima Qhibtiya Khader', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vitae Guardians', eligible: true, certificate_generated: false },
  { id: 'p-2520040057', registration_id: '2520040057', name: 'Omprakash Jena', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vitae Guardians', eligible: true, certificate_generated: false },
  { id: 'p-2520040026', registration_id: '2520040026', name: 'Yaswanth Srikar Sattineni', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vitae Guardians', eligible: true, certificate_generated: false },
  { id: 'p-2520030257', registration_id: '2520030257', name: 'praneeth gadila', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'team wow', eligible: true, certificate_generated: false },
  { id: 'p-2520030096', registration_id: '2520030096', name: 'Guru kiran Matray', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'team wow', eligible: true, certificate_generated: false },
  { id: 'p-2520030297', registration_id: '2520030297', name: 'Haadi Hasil', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'team wow', eligible: true, certificate_generated: false },
  { id: 'p-2520030365', registration_id: '2520030365', name: 'Angela Jose', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'team wow', eligible: true, certificate_generated: false },
  { id: 'p-2520080042', registration_id: '2520080042', name: 'Tanmai Duddukuri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'team wow', eligible: true, certificate_generated: false },
  { id: 'p-2520030244', registration_id: '2520030244', name: 'Navya Ch', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'team wow', eligible: true, certificate_generated: false },
  { id: 'p-2520030502', registration_id: '2520030502', name: 'Shaik Sabiya Thabassum', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQtech', eligible: true, certificate_generated: false },
  { id: 'p-2520030453', registration_id: '2520030453', name: 'Kolipaka Siri Chandana', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQtech', eligible: true, certificate_generated: false },
  { id: 'p-2520030537', registration_id: '2520030537', name: 'Monisha Raghini Chelle', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQtech', eligible: true, certificate_generated: false },
  { id: 'p-2520030441', registration_id: '2520030441', name: 'parvathaneni jaahnavi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQtech', eligible: true, certificate_generated: false },
  { id: 'p-2520030466', registration_id: '2520030466', name: 'G. CHERAN TEJ REDDY', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQtech', eligible: true, certificate_generated: false },
  { id: 'p-2520030429', registration_id: '2520030429', name: 'B. HIMAVANTH SAI GANESH', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQtech', eligible: true, certificate_generated: false },
  { id: 'p-2520040035', registration_id: '2520040035', name: 'K.Harshit', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innovexa', eligible: true, certificate_generated: false },
  { id: 'p-2520030490', registration_id: '2520030490', name: 'C.Sri Dhruthi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innovexa', eligible: true, certificate_generated: false },
  { id: 'p-2520090183', registration_id: '2520090183', name: 'Priyavallika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innovexa', eligible: true, certificate_generated: false },
  { id: 'p-2520030148', registration_id: '2520030148', name: 'Shashwath', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innovexa', eligible: true, certificate_generated: false },
  { id: 'p-2520040017', registration_id: '2520040017', name: 'Harshitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innovexa', eligible: true, certificate_generated: false },
  { id: 'p-2520040016', registration_id: '2520040016', name: 'Srinidhi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Innovexa', eligible: true, certificate_generated: false },
  { id: 'p-2520030199', registration_id: '2520030199', name: 'K.VISHNU', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM PHOENIX', eligible: true, certificate_generated: false },
  { id: 'p-2520030225', registration_id: '2520030225', name: 'RAMGARI RAGHUVEER', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM PHOENIX', eligible: true, certificate_generated: false },
  { id: 'p-2520090025', registration_id: '2520090025', name: 'DOKKU NIKHIL KRISHNA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM PHOENIX', eligible: true, certificate_generated: false },
  { id: 'p-2520090045', registration_id: '2520090045', name: 'PREM MANIKANTA REDDY', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM PHOENIX', eligible: true, certificate_generated: false },
  { id: 'p-2520030059', registration_id: '2520030059', name: 'Y.SATHVIKI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM PHOENIX', eligible: true, certificate_generated: false },
  { id: 'p-2520030597', registration_id: '2520030597', name: 'U.VIDHATH', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM PHOENIX', eligible: true, certificate_generated: false },
  { id: 'p-2520030336', registration_id: '2520030336', name: 'S Yuva Mahesh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'FreightIQ', eligible: true, certificate_generated: false },
  { id: 'p-2520030334', registration_id: '2520030334', name: 'K Shloka', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'FreightIQ', eligible: true, certificate_generated: false },
  { id: 'p-2520030531', registration_id: '2520030531', name: 'D.Venya Sri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'FreightIQ', eligible: true, certificate_generated: false },
  { id: 'p-2520030172', registration_id: '2520030172', name: 'B.Nikita', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'FreightIQ', eligible: true, certificate_generated: false },
  { id: 'p-2520030600', registration_id: '2520030600', name: 'Ch. Gayatri sri harshita', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ZeroTrace', eligible: true, certificate_generated: false },
  { id: 'p-2520080069', registration_id: '2520080069', name: 'Ananya Maroju', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ZeroTrace', eligible: true, certificate_generated: false },
  { id: 'p-2520030192', registration_id: '2520030192', name: 'A. Kuvira', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ZeroTrace', eligible: true, certificate_generated: false },
  { id: 'p-2520030275', registration_id: '2520030275', name: 'Kunal shahane', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ZeroTrace', eligible: true, certificate_generated: false },
  { id: 'p-2520090092', registration_id: '2520090092', name: 'V. Shiva Venkata Sai', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ZeroTrace', eligible: true, certificate_generated: false },
  { id: 'p-2520090029', registration_id: '2520090029', name: 'V. Rohith', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ZeroTrace', eligible: true, certificate_generated: false },
  { id: 'p-2520040043', registration_id: '2520040043', name: 'soundarya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Glitch', eligible: true, certificate_generated: false },
  { id: 'p-2520030033', registration_id: '2520030033', name: 'Nikhitha Gondi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Glitch', eligible: true, certificate_generated: false },
  { id: 'p-2520080009', registration_id: '2520080009', name: 'Krishnasree.M', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Glitch', eligible: true, certificate_generated: false },
  { id: 'p-2520030095', registration_id: '2520030095', name: 'Hansini.T', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Glitch', eligible: true, certificate_generated: false },
  { id: 'p-2520030411', registration_id: '2520030411', name: 'Manaswi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Glitch', eligible: true, certificate_generated: false },
  { id: 'p-2520080033', registration_id: '2520080033', name: 'hasini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Glitch', eligible: true, certificate_generated: false },
  { id: 'p-2520089071', registration_id: '2520089071', name: 'P Venkata Harshavardhan', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Kanyarasi', eligible: true, certificate_generated: false },
  { id: 'p-2520089070', registration_id: '2520089070', name: 'Salman Ahmed', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Kanyarasi', eligible: true, certificate_generated: false },
  { id: 'p-2520090181', registration_id: '2520090181', name: 'SURAPURAJU HIMASREE', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'INNOVEXA', eligible: true, certificate_generated: false },
  { id: 'p-2520030348', registration_id: '2520030348', name: 'SUGGULA SRI VISHNUPRIYA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'INNOVEXA', eligible: true, certificate_generated: false },
  { id: 'p-2520030298', registration_id: '2520030298', name: 'VUNGARALA MOUKTHIKA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'INNOVEXA', eligible: true, certificate_generated: false },
  { id: 'p-2520090227', registration_id: '2520090227', name: 'BONALA SUDHARSHINI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'INNOVEXA', eligible: true, certificate_generated: false },
  { id: 'p-2520030163', registration_id: '2520030163', name: 'THUMATI DHARANI DHAR', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'INNOVEXA', eligible: true, certificate_generated: false },
  { id: 'p-2520030366', registration_id: '2520030366', name: 'Lokesh Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Black panthers', eligible: true, certificate_generated: false },
  { id: 'p-2520030333', registration_id: '2520030333', name: 'rishik rao', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Black panthers', eligible: true, certificate_generated: false },
  { id: 'p-2520030369', registration_id: '2520030369', name: 'yashwanth Manoj', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Black panthers', eligible: true, certificate_generated: false },
  { id: 'p-2520030072', registration_id: '2520030072', name: 'Manasvi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Black panthers', eligible: true, certificate_generated: false },
  { id: 'p-2520030509', registration_id: '2520030509', name: 'Samita', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Black panthers', eligible: true, certificate_generated: false },
  { id: 'p-2520030218', registration_id: '2520030218', name: 'Sri Ram', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Black panthers', eligible: true, certificate_generated: false },
  { id: 'p-2520040038', registration_id: '2520040038', name: 'V.Shivadarahas', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'SIXGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520030452', registration_id: '2520030452', name: 'B Jhahnavi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'SIXGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520030105', registration_id: '2520030105', name: 'K.Shivareddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'SIXGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520030196', registration_id: '2520030196', name: 'P.Navadeep', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'SIXGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520030040', registration_id: '2520030040', name: 'Manoj', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'SIXGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520030217', registration_id: '2520030217', name: 'Sreshta', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'SIXGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520040030', registration_id: '2520040030', name: 'T.Sree Chandana', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'cynx', eligible: true, certificate_generated: false },
  { id: 'p-2520040023', registration_id: '2520040023', name: 'Sai Lahari', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'cynx', eligible: true, certificate_generated: false },
  { id: 'p-2520090154', registration_id: '2520090154', name: 'Rohita', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'cynx', eligible: true, certificate_generated: false },
  { id: 'p-2520030436', registration_id: '2520030436', name: 'Eesha Yuktha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Echo', eligible: true, certificate_generated: false },
  { id: 'p-2520030551', registration_id: '2520030551', name: 'Sai Bhavitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Echo', eligible: true, certificate_generated: false },
  { id: 'p-2520030431', registration_id: '2520030431', name: 'Varshini Bolla', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Echo', eligible: true, certificate_generated: false },
  { id: 'p-2520030556', registration_id: '2520030556', name: 'Hamsini Vanam', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Echo', eligible: true, certificate_generated: false },
  { id: 'p-2520030221', registration_id: '2520030221', name: 'Aswika Inturi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Echo', eligible: true, certificate_generated: false },
  { id: 'p-2520030258', registration_id: '2520030258', name: 'Sai Saranya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Echo', eligible: true, certificate_generated: false },
  { id: 'p-2520040024', registration_id: '2520040024', name: 'Samanvitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Horizon', eligible: true, certificate_generated: false },
  { id: 'p-2520040068', registration_id: '2520040068', name: 'Varshini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Horizon', eligible: true, certificate_generated: false },
  { id: 'p-2520030557', registration_id: '2520030557', name: 'Jasmitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Horizon', eligible: true, certificate_generated: false },
  { id: 'p-2520030499', registration_id: '2520030499', name: 'Sahiti', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Horizon', eligible: true, certificate_generated: false },
  { id: 'p-2520090137', registration_id: '2520090137', name: 'JAYAVARAPU SRI CHARAN', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Jarvis', eligible: true, certificate_generated: false },
  { id: 'p-2520030561', registration_id: '2520030561', name: 'SURISETTI PREM SAI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Jarvis', eligible: true, certificate_generated: false },
  { id: 'p-2520080060', registration_id: '2520080060', name: 'JADALA SOHAN', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Jarvis', eligible: true, certificate_generated: false },
  { id: 'p-2520030106', registration_id: '2520030106', name: 'DUGGANABOINA MOHIT VENKAT SAI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Jarvis', eligible: true, certificate_generated: false },
  { id: 'p-2520030586', registration_id: '2520030586', name: 'HAMSIKA PEDDINA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Jarvis', eligible: true, certificate_generated: false },
  { id: 'p-2520030154', registration_id: '2520030154', name: 'POTHURU BHAVANA MANASWINI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Jarvis', eligible: true, certificate_generated: false },
  { id: 'p-2520090166', registration_id: '2520090166', name: 'RAJABOINA VISHNU VARDHAN', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HexaCode', eligible: true, certificate_generated: false },
  { id: 'p-2520090070', registration_id: '2520090070', name: 'K. AMRUTHAVALLI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HexaCode', eligible: true, certificate_generated: false },
  { id: 'p-2520090121', registration_id: '2520090121', name: 'THOTA JHANASRI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HexaCode', eligible: true, certificate_generated: false },
  { id: 'p-2520080067', registration_id: '2520080067', name: 'DHEERAJ VISHNU SAI TEJA GOPALAM', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HexaCode', eligible: true, certificate_generated: false },
  { id: 'p-2520090022', registration_id: '2520090022', name: 'K. SRIRAM', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HexaCode', eligible: true, certificate_generated: false },
  { id: 'p-2520090048', registration_id: '2520090048', name: 'I. HARICHARANSAI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HexaCode', eligible: true, certificate_generated: false },
  { id: 'p-2520090157', registration_id: '2520090157', name: 'Samyuktha Kandukuri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'QuickAid', eligible: true, certificate_generated: false },
  { id: 'p-2520090170', registration_id: '2520090170', name: 'Svara Haasini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'QuickAid', eligible: true, certificate_generated: false },
  { id: 'p-2520090047', registration_id: '2520090047', name: 'Harshika Mallipeddi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'QuickAid', eligible: true, certificate_generated: false },
  { id: 'p-2520090056', registration_id: '2520090056', name: 'Madhulika Chilumula', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'QuickAid', eligible: true, certificate_generated: false },
  { id: 'p-2520040119', registration_id: '2520040119', name: 'Sameera Reddy Ravulapati', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'QuickAid', eligible: true, certificate_generated: false },
  { id: 'p-2520080053', registration_id: '2520080053', name: 'Ruhitha Pinninti', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'QuickAid', eligible: true, certificate_generated: false },
  { id: 'p-2520030271', registration_id: '2520030271', name: 'Raghava akkinepally', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Route Riders', eligible: true, certificate_generated: false },
  { id: 'p-2520030060', registration_id: '2520030060', name: 'J.Hansika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Route Riders', eligible: true, certificate_generated: false },
  { id: 'p-2520030212', registration_id: '2520030212', name: 'N.Rishika Chowdary', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Route Riders', eligible: true, certificate_generated: false },
  { id: 'p-2520030521', registration_id: '2520030521', name: 'Vishal goud', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Route Riders', eligible: true, certificate_generated: false },
  { id: 'p-2520030553', registration_id: '2520030553', name: 'B Jaswanth Bhaskar', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Route Riders', eligible: true, certificate_generated: false },
  { id: 'p-2520090104', registration_id: '2520090104', name: 'TEJASWIN AMARA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HELLO WORLD', eligible: true, certificate_generated: false },
  { id: 'p-2520090019', registration_id: '2520090019', name: 'CH.SRICHARAN', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HELLO WORLD', eligible: true, certificate_generated: false },
  { id: 'p-2520030331', registration_id: '2520030331', name: 'ARNAV CHITIKENA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HELLO WORLD', eligible: true, certificate_generated: false },
  { id: 'p-2520030534', registration_id: '2520030534', name: 'p.shashe preetham', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HELLO WORLD', eligible: true, certificate_generated: false },
  { id: 'p-2520090108', registration_id: '2520090108', name: 'CH.SAI GEETHIKA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'HELLO WORLD', eligible: true, certificate_generated: false },
  { id: 'p-2520520027', registration_id: '2520520027', name: 'Arshad', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'NEXTGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520520015', registration_id: '2520520015', name: 'Taruni Goud', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'NEXTGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520520014', registration_id: '2520520014', name: 'Vikasini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'NEXTGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520520025', registration_id: '2520520025', name: 'Umar shad', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'NEXTGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520520016', registration_id: '2520520016', name: 'Hansika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'NEXTGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520520031', registration_id: '2520520031', name: 'Pranav shanmukh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'NEXTGEN', eligible: true, certificate_generated: false },
  { id: 'p-2520030068', registration_id: '2520030068', name: 'G.Neha Deepika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code Sirens', eligible: true, certificate_generated: false },
  { id: 'p-2520030161', registration_id: '2520030161', name: 'M.Srinikitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code Sirens', eligible: true, certificate_generated: false },
  { id: 'p-2520030158', registration_id: '2520030158', name: 'S.Anusha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code Sirens', eligible: true, certificate_generated: false },
  { id: 'p-2520030216', registration_id: '2520030216', name: 'D.Deekshitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code Sirens', eligible: true, certificate_generated: false },
  { id: 'p-2520030103', registration_id: '2520030103', name: 'K.Poojitha Sai', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code Sirens', eligible: true, certificate_generated: false },
  { id: 'p-2520030086', registration_id: '2520030086', name: 'J.Chandra hasini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code Sirens', eligible: true, certificate_generated: false },
  { id: 'p-2520090026', registration_id: '2520090026', name: 'Venkat Siddharth Reddy Moku', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CipherForge', eligible: true, certificate_generated: false },
  { id: 'p-2520030368', registration_id: '2520030368', name: 'Satya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CipherForge', eligible: true, certificate_generated: false },
  { id: 'p-2520030073', registration_id: '2520030073', name: 'Sushmitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CipherForge', eligible: true, certificate_generated: false },
  { id: 'p-2520080028', registration_id: '2520080028', name: 'Anirudh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CipherForge', eligible: true, certificate_generated: false },
  { id: 'p-2520030268', registration_id: '2520030268', name: 'Rishi A', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CipherForge', eligible: true, certificate_generated: false },
  { id: 'p-2520030288', registration_id: '2520030288', name: 'Vennela E', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'CipherForge', eligible: true, certificate_generated: false },
  { id: 'p-252030069', registration_id: '252030069', name: 'Hemaswi girneni', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'codeSIX', eligible: true, certificate_generated: false },
  { id: 'p-2520090088', registration_id: '2520090088', name: 'Darshan', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Codes and chaos', eligible: true, certificate_generated: false },
  { id: 'p-2520090097', registration_id: '2520090097', name: 'V. Sathvik', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Codes and chaos', eligible: true, certificate_generated: false },
  { id: 'p-2520030180', registration_id: '2520030180', name: 'J. Vivek', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Codes and chaos', eligible: true, certificate_generated: false },
  { id: 'p-2520030185', registration_id: '2520030185', name: 'R. Abhishikta', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Codes and chaos', eligible: true, certificate_generated: false },
  { id: 'p-2520030197', registration_id: '2520030197', name: 'K. Partheev', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Codes and chaos', eligible: true, certificate_generated: false },
  { id: 'p-2520090023', registration_id: '2520090023', name: 'M.Chaitanya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Prism', eligible: true, certificate_generated: false },
  { id: 'p-2520030063', registration_id: '2520030063', name: 'K.Shankar', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Prism', eligible: true, certificate_generated: false },
  { id: 'p-2520030272', registration_id: '2520030272', name: 'U.Srilaxmi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Prism', eligible: true, certificate_generated: false },
  { id: 'p-2520030146', registration_id: '2520030146', name: 'K.Srinivas', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Prism', eligible: true, certificate_generated: false },
  { id: 'p-2520030517', registration_id: '2520030517', name: 'P.Nithya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Prism', eligible: true, certificate_generated: false },
  { id: 'p-2520030249', registration_id: '2520030249', name: 'D.Namith', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Prism', eligible: true, certificate_generated: false },
  { id: 'p-2520080041', registration_id: '2520080041', name: 'Sathwik Naidu Sannapanen', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DreamSpinners', eligible: true, certificate_generated: false },
  { id: 'p-2520090148', registration_id: '2520090148', name: 'Sainath Lingampally', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DreamSpinners', eligible: true, certificate_generated: false },
  { id: 'p-2520090081', registration_id: '2520090081', name: 'SAI RAM PRAGNEY MURIKIPUDI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DreamSpinners', eligible: true, certificate_generated: false },
  { id: 'p-2520090141', registration_id: '2520090141', name: 'Rachapudi Nishanth', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DreamSpinners', eligible: true, certificate_generated: false },
  { id: 'p-2520030182', registration_id: '2520030182', name: 'P.Venkata Sri Sai Madhurima', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DreamSpinners', eligible: true, certificate_generated: false },
  { id: 'p-2520030074', registration_id: '2520030074', name: 'Kankanampati Bhargavi', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DreamSpinners', eligible: true, certificate_generated: false },
  { id: 'p-2520030355', registration_id: '2520030355', name: 'Ch Suraj Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TerraFlux', eligible: true, certificate_generated: false },
  { id: 'p-2520090122', registration_id: '2520090122', name: 'S Rithesh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TerraFlux', eligible: true, certificate_generated: false },
  { id: 'p-2520030533', registration_id: '2520030533', name: 'G Bharadwaj Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TerraFlux', eligible: true, certificate_generated: false },
  { id: 'p-2520090114', registration_id: '2520090114', name: 'K Harsith Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TerraFlux', eligible: true, certificate_generated: false },
  { id: 'p-2520090160', registration_id: '2520090160', name: 'Bujangari Snigdha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TerraFlux', eligible: true, certificate_generated: false },
  { id: 'p-2520090190', registration_id: '2520090190', name: 'Sumanjali', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TerraFlux', eligible: true, certificate_generated: false },
  { id: 'p-2520030167', registration_id: '2520030167', name: 'Darshini', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code-z', eligible: true, certificate_generated: false },
  { id: 'p-2520030593', registration_id: '2520030593', name: 'Mahima', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code-z', eligible: true, certificate_generated: false },
  { id: 'p-2520080016', registration_id: '2520080016', name: 'Varshith Comple', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code-z', eligible: true, certificate_generated: false },
  { id: 'p-2520030226', registration_id: '2520030226', name: 'Sathvik', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code-z', eligible: true, certificate_generated: false },
  { id: 'p-2520030111', registration_id: '2520030111', name: 'Pramod', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code-z', eligible: true, certificate_generated: false },
  { id: 'p-2520080049', registration_id: '2520080049', name: 'Rishith', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Code-z', eligible: true, certificate_generated: false },
  { id: 'p-2520080062', registration_id: '2520080062', name: 'Sahasra Yeruva', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Skill Issue', eligible: true, certificate_generated: false },
  { id: 'p-2520030015', registration_id: '2520030015', name: 'Dihitha.P', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Skill Issue', eligible: true, certificate_generated: false },
  { id: 'p-2520030038', registration_id: '2520030038', name: 'Bhavyanshi.Y', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Skill Issue', eligible: true, certificate_generated: false },
  { id: 'p-2520030160', registration_id: '2520030160', name: 'Spandana.K', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Skill Issue', eligible: true, certificate_generated: false },
  { id: 'p-2520030339', registration_id: '2520030339', name: 'Tanmayee Muppaneni', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Abusers', eligible: true, certificate_generated: false },
  { id: 'p-2520030329', registration_id: '2520030329', name: 'Devika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Abusers', eligible: true, certificate_generated: false },
  { id: 'p-2520090239', registration_id: '2520090239', name: 'Vansika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Abusers', eligible: true, certificate_generated: false },
  { id: 'p-2520090240', registration_id: '2520090240', name: 'Neha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Abusers', eligible: true, certificate_generated: false },
  { id: 'p-2520030480', registration_id: '2520030480', name: 'Rikhil', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Abusers', eligible: true, certificate_generated: false },
  { id: 'p-2520030088', registration_id: '2520030088', name: 'Satyan', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Abusers', eligible: true, certificate_generated: false },
  { id: 'p-2520090060', registration_id: '2520090060', name: 'VEDADRI NAIDU PINNINTI', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM AURORA', eligible: true, certificate_generated: false },
  { id: 'p-2520030135', registration_id: '2520030135', name: 'JAISWAL REDDY', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM AURORA', eligible: true, certificate_generated: false },
  { id: 'p-2520030138', registration_id: '2520030138', name: 'HRUDAY DEEPAK', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM AURORA', eligible: true, certificate_generated: false },
  { id: 'p-2520030438', registration_id: '2520030438', name: 'MANASA.M', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM AURORA', eligible: true, certificate_generated: false },
  { id: 'p-2520090132', registration_id: '2520090132', name: 'G.KEERTHANA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM AURORA', eligible: true, certificate_generated: false },
  { id: 'p-2520040105', registration_id: '2520040105', name: 'SHRADDHA', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'TEAM AURORA', eligible: true, certificate_generated: false },
  { id: 'p-2520030385', registration_id: '2520030385', name: 'Tanvitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DevX', eligible: true, certificate_generated: false },
  { id: 'p-2520090068', registration_id: '2520090068', name: 'kaveri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DevX', eligible: true, certificate_generated: false },
  { id: 'p-2520090077', registration_id: '2520090077', name: 'Navya', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DevX', eligible: true, certificate_generated: false },
  { id: 'p-2520030132', registration_id: '2520030132', name: 'Tejasri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DevX', eligible: true, certificate_generated: false },
  { id: 'p-2520030018', registration_id: '2520030018', name: 'Laxmikanth', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'DevX', eligible: true, certificate_generated: false },
  { id: 'p-2520090039', registration_id: '2520090039', name: 'S.Rishitha Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vision fleet', eligible: true, certificate_generated: false },
  { id: 'p-2520030175', registration_id: '2520030175', name: 'M.Gayatri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vision fleet', eligible: true, certificate_generated: false },
  { id: 'p-2520030129', registration_id: '2520030129', name: 'O.Sai Sujith', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vision fleet', eligible: true, certificate_generated: false },
  { id: 'p-2520030598', registration_id: '2520030598', name: 'P.Sai Varshith Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vision fleet', eligible: true, certificate_generated: false },
  { id: 'p-2520030611', registration_id: '2520030611', name: 'K.Hemanth', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vision fleet', eligible: true, certificate_generated: false },
  { id: 'p-2520090124', registration_id: '2520090124', name: 'S.Sai Saketh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Vision fleet', eligible: true, certificate_generated: false },
  { id: 'p-2520090125', registration_id: '2520090125', name: 'V. Hasith Varma', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Culture Code', eligible: true, certificate_generated: false },
  { id: 'p-2520030375', registration_id: '2520030375', name: 'P. Sai Harshith Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Culture Code', eligible: true, certificate_generated: false },
  { id: 'p-2520080066', registration_id: '2520080066', name: 'Amrutha Varshini J', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Culture Code', eligible: true, certificate_generated: false },
  { id: 'p-2520030412', registration_id: '2520030412', name: 'C. Amrutha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Culture Code', eligible: true, certificate_generated: false },
  { id: 'p-2520090042', registration_id: '2520090042', name: 'P. Chakrika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Culture Code', eligible: true, certificate_generated: false },
  { id: 'p-2520030408', registration_id: '2520030408', name: 'B. Jamuna', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Culture Code', eligible: true, certificate_generated: false },
  { id: 'p-2520080011', registration_id: '2520080011', name: 'K. Samanth', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQTech', eligible: true, certificate_generated: false },
  { id: 'p-2520080007', registration_id: '2520080007', name: 'Harshitha. B', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQTech', eligible: true, certificate_generated: false },
  { id: 'p-2520090151', registration_id: '2520090151', name: 'Naeeni Satwika', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQTech', eligible: true, certificate_generated: false },
  { id: 'p-2520090179', registration_id: '2520090179', name: 'P. Suraj', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQTech', eligible: true, certificate_generated: false },
  { id: 'p-2520080006', registration_id: '2520080006', name: 'G.V. Karthik Reddy', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'ResQTech', eligible: true, certificate_generated: false },
  { id: 'p-2520040009', registration_id: '2520040009', name: 'n.pranay chowdary', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Big potatos stuff', eligible: true, certificate_generated: false },
  { id: 'p-2520030112', registration_id: '2520030112', name: 'B.tanya sri', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Big potatos stuff', eligible: true, certificate_generated: false },
  { id: 'p-2520090090', registration_id: '2520090090', name: 'sai vihamsh', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Big potatos stuff', eligible: true, certificate_generated: false },
  { id: 'p-2520030104', registration_id: '2520030104', name: 'harshitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Big potatos stuff', eligible: true, certificate_generated: false },
  { id: 'p-2520030150', registration_id: '2520030150', name: 'advaitha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Big potatos stuff', eligible: true, certificate_generated: false },
  { id: 'p-2520030360', registration_id: '2520030360', name: 'neha', email: '', department: 'CSE', college: 'Koneru Lakshmaiah Education Foundation, Bachupally', event_name: 'Smart India Hackathon 2026', team_name: 'Big potatos stuff', eligible: true, certificate_generated: false },
];


export const INITIAL_CERTIFICATES: CertificateRecord[] = [];

class MockDatabaseStore {
  private participants: Map<string, Participant>;
  private certificates: Map<string, CertificateRecord>;

  constructor() {
    this.participants = new Map();
    this.certificates = new Map();

    INITIAL_PARTICIPANTS.forEach((p) => {
      this.participants.set(p.registration_id.trim().toLowerCase(), { ...p });
    });
  }

  public findParticipantByRegId(registrationId: string): Participant | undefined {
    return this.getParticipantByRegistrationId(registrationId);
  }

  public findParticipantByRegistrationId(registrationId: string): Participant | undefined {
    return this.getParticipantByRegistrationId(registrationId);
  }

  public getParticipantByRegistrationId(registrationId: string): Participant | undefined {
    return this.participants.get(registrationId.trim().toLowerCase());
  }

  public getAllParticipants(): Participant[] {
    return Array.from(this.participants.values());
  }

  public upsertParticipant(participant: Participant): Participant {
    const key = participant.registration_id.trim().toLowerCase();
    this.participants.set(key, participant);
    return participant;
  }

  public bulkImportParticipants(newParticipants: Participant[]): { imported: number; rejected: Participant[] } {
    let imported = 0;
    const rejected: Participant[] = [];

    newParticipants.forEach((p) => {
      if (!p.registration_id || !p.name) {
        rejected.push(p);
      } else {
        this.upsertParticipant(p);
        imported++;
      }
    });

    return { imported, rejected };
  }

  public findCertificateById(certificateId: string): CertificateRecord | undefined {
    return this.getCertificateById(certificateId);
  }

  public getCertificateById(certificateId: string): CertificateRecord | undefined {
    return this.certificates.get(certificateId.trim().toUpperCase());
  }

  public findCertificateByRegId(registrationId: string): CertificateRecord | undefined {
    return this.getCertificateByRegistrationId(registrationId);
  }

  public findCertificateByRegistrationId(registrationId: string): CertificateRecord | undefined {
    return this.getCertificateByRegistrationId(registrationId);
  }

  public getCertificateByRegistrationId(registrationId: string): CertificateRecord | undefined {
    return Array.from(this.certificates.values()).find(
      (c) => c.registration_id.trim().toLowerCase() === registrationId.trim().toLowerCase()
    );
  }

  public saveCertificate(cert: CertificateRecord): CertificateRecord {
    this.certificates.set(cert.certificate_id.trim().toUpperCase(), cert);
    const participant = this.getParticipantByRegistrationId(cert.registration_id);
    if (participant) {
      participant.certificate_generated = true;
      participant.certificate_id = cert.certificate_id;
    }
    return cert;
  }

  public getAllCertificates(): CertificateRecord[] {
    return Array.from(this.certificates.values()).sort((a, b) =>
      (b.created_at || b.issue_date).localeCompare(a.created_at || a.issue_date)
    );
  }

  public updateCertificateStatus(certificateId: string, status: "VALID" | "REVOKED"): boolean {
    const cert = this.getCertificateById(certificateId);
    if (cert) {
      cert.status = status;
      return true;
    }
    return false;
  }

  // Form Config & Response Submission Methods
  private formConfig: FormConfig = DEFAULT_FORM_CONFIG;
  private formSubmissions: FormSubmission[] = [];

  public getFormConfig(): FormConfig {
    return this.formConfig;
  }

  public updateFormConfig(config: FormConfig): FormConfig {
    this.formConfig = config;
    return this.formConfig;
  }

  public saveFormSubmission(data: Record<string, string>): FormSubmission {
    const sub: FormSubmission = {
      id: `SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      submitted_at: new Date().toISOString(),
      data,
    };
    this.formSubmissions.unshift(sub);
    return sub;
  }

  public getFormSubmissions(): FormSubmission[] {
    return this.formSubmissions;
  }
}

/**
 * The store is held on `globalThis` so that issued certificates survive Next.js
 * hot-reloads in development and module re-evaluation between route handlers.
 * A module-level `new MockDatabaseStore()` gets a fresh (empty) certificate map
 * every time the module graph is rebuilt, which silently loses issued records.
 */
const globalStore = globalThis as typeof globalThis & {
  __sihMockDb?: MockDatabaseStore;
};

export const mockDb: MockDatabaseStore =
  globalStore.__sihMockDb ?? (globalStore.__sihMockDb = new MockDatabaseStore());
