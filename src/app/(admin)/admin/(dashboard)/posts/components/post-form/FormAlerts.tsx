"use client";

interface FormAlertsProps {
  error: string;
  success: string;
}

export default function FormAlerts({ error, success }: FormAlertsProps) {
  return (
    <>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] rounded-lg text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] rounded-lg text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
          {success}
        </div>
      )}
    </>
  );
}
