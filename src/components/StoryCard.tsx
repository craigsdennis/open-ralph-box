import type { Story } from "../../worker/agents/project";

interface StoryCardProps {
  story: Story;
  index?: number;
}

const statusConfig = {
  backlog: {
    label: "BACKLOG",
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
  },
  "in-progress": {
    label: "IN PROGRESS",
    color: "text-electric-blue",
    bg: "bg-electric-blue/10",
    border: "border-electric-blue/30",
  },
  done: {
    label: "DONE",
    color: "text-terminal-green",
    bg: "bg-terminal-green/10",
    border: "border-terminal-green/30",
  },
};

const priorityConfig = {
  critical: { label: "CRITICAL", color: "text-red-500" },
  high: { label: "HIGH", color: "text-cf-orange" },
  medium: { label: "MEDIUM", color: "text-yellow-500" },
  low: { label: "LOW", color: "text-gray-400" },
};

export function StoryCard({ story, index = 0 }: StoryCardProps) {
  const status = statusConfig[story.status];
  const priority = priorityConfig[story.priority];

  return (
    <div
      className={`group terminal-border bg-panel-surface hover:bg-elevated-surface transition-all duration-300 rounded-lg overflow-hidden animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
    >
      {/* Header */}
      <div className="p-5 border-b border-circuit-line">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-gray-500">{story.id}</span>
              {story.sprint && (
                <span className="font-mono text-xs px-2 py-0.5 bg-command-bg rounded text-gray-400">
                  SPRINT {story.sprint}
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-white leading-tight group-hover:text-cf-orange transition-colors">
              {story.title}
            </h3>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <span
              className={`font-mono text-[10px] font-bold px-2 py-1 rounded ${status.bg} ${status.color} ${status.border} border`}
            >
              {status.label}
            </span>
            {story.points && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-cf-orange" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-mono text-xs text-gray-400">{story.points}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
          {story.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-command-bg/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`font-mono text-xs font-semibold ${priority.color}`}>
            {priority.label}
          </span>
          {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
            <span className="font-mono text-xs text-gray-500">
              {story.acceptanceCriteria.length} criteria
            </span>
          )}
          {story.dependencies && story.dependencies.length > 0 && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <span className="font-mono text-xs text-gray-600">
                {story.dependencies.length}
              </span>
            </div>
          )}
        </div>

        <button className="text-gray-500 hover:text-cf-orange transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
