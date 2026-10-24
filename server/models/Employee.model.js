import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId:  { type: String, required: true, unique: true, trim: true },
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:       { type: String, trim: true },
    address:     { type: String, trim: true },
    designation: { type: String, required: true, trim: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    dateOfJoining: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'resigned', 'terminated'],
      default: 'active',
    },
    salary:  { type: Number, default: 0 },
    avatar:  { type: String, default: '' },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    leaveBalance: {
      casual:  { type: Number, default: 10 },
      sick:    { type: Number, default: 7 },
      annual:  { type: Number, default: 14 },
    },
  },
  { timestamps: true }
);

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });
employeeSchema.index({ department: 1, status: 1 });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
