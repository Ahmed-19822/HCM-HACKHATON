import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month:       { type: Number, required: true },   // 1-12
    year:        { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    workingDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    leaveDays:   { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    deductions:  { type: Number, default: 0 },
    bonuses:     { type: Number, default: 0 },
    netSalary:   { type: Number },
    status: {
      type: String,
      enum: ['draft', 'paid'],
      default: 'draft',
    },
    paidAt: { type: Date },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Compound index: one payroll per employee per month per year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

// Auto-calculate net salary
payrollSchema.pre('save', function (next) {
  const perDayRate = this.basicSalary / this.workingDays;
  const earned     = perDayRate * this.presentDays;
  this.netSalary   = earned + this.bonuses - this.deductions;
  next();
});

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
