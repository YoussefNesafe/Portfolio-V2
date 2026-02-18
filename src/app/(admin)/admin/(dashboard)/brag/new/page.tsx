import BragEntryForm from "../../../components/brag/BragEntryForm";

export default function NewBragEntryPage() {
  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
        New Brag Entry
      </h1>
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw]">
        <BragEntryForm />
      </div>
    </div>
  );
}
