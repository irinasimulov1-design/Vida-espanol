"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track, type TrackEvent } from "@/lib/track";

/** next/link koji pri kliku šalje GA događaj (za server komponente). */
export default function TrackLink({
  event,
  params,
  ...props
}: ComponentProps<typeof Link> & { event: TrackEvent; params?: Record<string, string> }) {
  return <Link {...props} onClick={() => track(event, params)} />;
}
