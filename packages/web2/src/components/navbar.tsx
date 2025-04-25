import { useEffect } from "react";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import { CircularProgress, User } from "@heroui/react";
import clsx from "clsx";

import { trpcReact } from '../providers/trpc';
import { siteConfig } from "@/config/site";

import { getWebToken } from "@/utils/tokenhelper";

import { useGlobalTrpcState } from "@/providers/storage";

function extractUserData(userResponse?: {
  value: string;
  id: string;
}[]) {
  const userData = {
    GameDisplayName: '',
    GameDisplayPicRaw: '',
    Gamerscore: '',
    Gamertag: '',
  }

  if(userResponse === undefined) {
    return undefined;
  }
  for(const response of userResponse) {
    userData[response.id as keyof typeof userData] = response.value;
  }

  return userData;
}

export const Navbar = () => {
  const [profileData, setProfileData] = useGlobalTrpcState('user_profile', undefined);
  const { data: profileDataApi } = trpcReact.profile_get_current.useQuery({ token: getWebToken() }, { enabled: (profileData === undefined) });
  useEffect(() => { setProfileData(extractUserData(profileDataApi?.data.profileUsers[0].settings)) }, [profileDataApi]);

  const gamerTagElement = (
    profileData?.Gamertag === undefined ?
      <CircularProgress size="sm" aria-label="Loading gamertag..."></CircularProgress>
    :
      <User
      avatarProps={{
        src: profileData?.GameDisplayPicRaw,
        showFallback: false,
        disableAnimation: true,
      }}
      description={profileData?.Gamerscore}
      name={profileData?.Gamertag}></User>
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <p className="font-bold text-inherit">Greenlight</p>
          </Link>
        </NavbarBrand>
        <div className="hidden sm:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {gamerTagElement}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {gamerTagElement}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
