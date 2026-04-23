import { useState } from 'react';
import { X, Calendar, Clock, Video, Loader2 } from 'lucide-react';
import { triggerAction } from '../api/carbonApi';
interface ScheduleMeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  partnerType: 'company' | 'ngo';
}

export function ScheduleMeetModal({ isOpen, onClose, partnerName, partnerType }: ScheduleMeetModalProps) {
  if (!isOpen) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await triggerAction('schedule_meet_submit', { partnerName, partnerType });
      alert(`Meeting scheduled successfully with ${partnerName}!`);
      onClose();
    } catch (err: any) {
      alert(`Failed to schedule meeting: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-card backdrop-blur-md rounded-2xl border border-border shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3>Schedule Meeting</h3>
              <p className="text-sm text-muted-foreground">{partnerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-accent rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Meeting Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Meeting Time
            </label>
            <input
              type="time"
              required
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm mb-2">Duration</label>
            <select className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all">
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-sm mb-2 flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              Meeting Type
            </label>
            <select className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all">
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="in-person">In Person</option>
            </select>
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-sm mb-2">Meeting Agenda (Optional)</label>
            <textarea
              rows={3}
              placeholder="Discuss carbon credit purchase terms..."
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-primary/50 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
