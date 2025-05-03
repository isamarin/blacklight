import { title } from "@/components/primitives";
import { Button } from "@heroui/react";

import { useNavigate } from "react-router-dom";

export default function XCloudPage() {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col justify-center gap-4 py-4">
      <div className="flex flex-row gap-2">
        <h1 className={title() + ' flex-grow'}>Recent Games</h1>

        <Button size="sm" className="item-end" data-nav data-nav-group="default" onPress={() => navigate('/xcloud/library') }>View Library</Button>
      </div>

      <div className="flex flex-col gap-2">
        Games here...
      </div>

    </section>
  );
}
