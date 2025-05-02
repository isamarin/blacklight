import { title } from "@/components/primitives";
import SettingsLayout from "@/layouts/settings";

export default function SettingsPage() {
  return (
    <SettingsLayout>
      <section className="flex flex-col gap-4 py-8 md:py-10">
          <h1 className={title()}>Settings</h1>
      </section>
    </SettingsLayout>
  );
}
