interface PageHeaderProps {
    title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
    return (
        <div className="w-[390px] h-16 px-4 py-2 bg-content-surface-inverse justify-between items-center inline-flex">
            <div className="h-[34px] justify-start items-center gap-4 flex">
                <div className="w-6 h-6 relative" />
                <div className="text-content-title text-2xl font-bold font-manrope leading-[34px]">{title}</div>
            </div>
            <div className="h-6 justify-end items-center gap-8 flex">
                <div className="w-6 h-6 relative" />
                <div className="w-6 h-6 relative" />
            </div>
        </div>
    );
}