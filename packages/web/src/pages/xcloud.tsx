import { title } from "@/components/primitives";
import { Button } from "@heroui/react";

import { showErrorToast } from "@/utils/toast";

export default function xCloudPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>Blog</h1>

        <Button onPress={ () => { showErrorToast('Tester') }} data-nav data-nav-group="default">Toast!</Button>
      </div>
    </section>
  );
}
