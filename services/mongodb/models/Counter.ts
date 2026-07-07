import { Schema, model, models } from "mongoose";

// Generic atomic sequence counter (e.g. _id: "APT-260705" -> seq: 1, 2, 3...)
const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

const Counter = models.Counter ?? model("Counter", counterSchema);
export default Counter;
