import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['casual', 'sick', 'annual'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    reason:    { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approverComment: { type: String, trim: true },
    totalDays:  { type: Number },
  },
  { timestamps: true }
);

leaveSchema.pre('save', function () {
  if (this.startDate && this.endDate && (this.isModified('startDate') || this.isModified('endDate') || this.totalDays == null)) {
    let days = 0;
    const cursor = new Date(this.startDate);
    cursor.setHours(0, 0, 0, 0);
    const last = new Date(this.endDate);
    last.setHours(0, 0, 0, 0);
    while (cursor <= last) {
      const dow = cursor.getDay();
      if (dow !== 0 && dow !== 6) days += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    this.totalDays = days;
  }
});

leaveSchema.index({ employee: 1, status: 1, startDate: 1 });

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
