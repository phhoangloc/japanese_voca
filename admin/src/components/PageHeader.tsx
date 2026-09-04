interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-[13px] text-ink-soft">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
