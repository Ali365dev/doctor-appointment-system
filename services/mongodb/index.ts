export { connectDB, default } from "./connection";

export { default as User } from "./models/User";
export type { UserDoc } from "./models/User";

// ==================================================
// Models (to be implemented in a future phase)
// ==================================================
// export { default as Patient } from "./models/Patient";
// export { default as Doctor } from "./models/Doctor";
// export { default as Appointment } from "./models/Appointment";
// export { default as Payment } from "./models/Payment";
// export { default as MedicalRecord } from "./models/MedicalRecord";
// export { default as Chat } from "./models/Chat";
// export { default as Review } from "./models/Review";
// export { default as Clinic } from "./models/Clinic";
// export { default as Cms } from "./models/Cms";
// export { default as Notification } from "./models/Notification";
