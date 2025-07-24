'use client';

interface NewsCardProps {
  title: string;
  timestamp?: string;
}

export default function NewsCard({ title, timestamp }: NewsCardProps) {
  return (
    <div className="w-96 flex flex-col gap-3">
      <div className="h-52 p-5 bg-white rounded-3xl flex flex-col justify-end gap-2.5 shadow-sm">
        <div className="w-80 flex flex-col gap-2.5">
          <div className="w-10 h-10 bg-black/5 rounded-full" />
          <div className="text-black text-xl font-medium font-['SF_Pro_Rounded'] leading-relaxed">
            {title}
          </div>
        </div>
      </div>
      {timestamp && (
        <div className="px-2.5 flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#d9d9d9] rounded-full" />
          <div className="text-black/40 text-xs font-medium font-['SF_Pro_Rounded']">
            {timestamp}
          </div>
        </div>
      )}
    </div>
  );
} 