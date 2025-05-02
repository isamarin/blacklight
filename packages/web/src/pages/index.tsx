import { title } from "@/components/primitives";
import { Link } from "react-router-dom"
import { Card, CardFooter, CardHeader, Button, Spinner } from "@heroui/react";

import { useTRPC } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { getWebToken } from "@/utils/tokenhelper";

export default function IndexPage() {
  const trpc = useTRPC()

  const consoles = useQuery(trpc.smartglass_consoles_list.queryOptions({ token: getWebToken() }))
  
  return (
    <section className="flex flex-col justify-center gap-4 py-8 md:py-10">
      <h1 className={title()}>My Consoles</h1>
      <div className="gap-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

        {consoles.isLoading && (
          <Spinner></Spinner>
        )}
        {consoles.data?.data.result.map((console) => (
        <Link key={console.id} to={'/stream/' + console.id} data-nav data-nav-group="default">
          <Card isFooterBlurred className="w-full h-[150px]">
            <CardHeader className="absolute z-10 top-1 flex-col items-start">
              <h4 className="text-white/60 font-medium text-2xl">{console.name}</h4>
            </CardHeader>
            <CardFooter className="absolute bg-white/10 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
              <div>
                <p className="text-tiny">{console.id}</p>
                <p className="text-tiny">{console.powerState}</p>
              </div>
              <Button className="text-tiny" color="primary" radius="full" size="sm">
                Start Stream
              </Button>
            </CardFooter>
          </Card>
        </Link>
        ))}

      </div>
    </section>
  );
}
