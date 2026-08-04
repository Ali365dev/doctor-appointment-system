export { connectDB, default } from "./connection";

export { default as User } from "./models/User";
export type { UserDoc } from "./models/User";

export { default as Clinic } from "./models/Clinic";
export type { ClinicDoc } from "./models/Clinic";

export { default as Appointment } from "./models/Appointment";
export type { AppointmentDoc } from "./models/Appointment";

export { default as Payment } from "./models/Payment";
export type { PaymentDoc } from "./models/Payment";

export { default as Cms } from "./models/Cms";
export type { CmsDoc } from "./models/Cms";

export { default as Review } from "./models/Review";
export type { ReviewDoc } from "./models/Review";
