const QUESTIONS = [
  "What does this report mean?",
  "Should I continue this medicine?",
  "Can I reduce dosage?",
  "Should medicine be changed?",
  "Do I need another test?",
];

export default function QuickQuestionCards({ onSelect }: { onSelect: (question: string) => void }) {
  return (
    <div className="flex flex-wrap gap-xs">
      {QUESTIONS.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          className="px-sm py-xs rounded-full border border-outline-variant text-label-md text-on-surface-variant hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
