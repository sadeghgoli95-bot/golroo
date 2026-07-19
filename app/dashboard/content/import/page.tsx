import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ImportWorkspace from "@/components/dashboard/import/ImportWorkspace";

export default function ImportPage() {
  return (
    <>
      <DashboardHeader title="ورود مقاله" description="متن خام مقاله را وارد کنید" />
      <ImportWorkspace />
    </>
  );
}
