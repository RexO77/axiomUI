// Server-safe: no hooks and no "use client", so the wall renders this still
// on the server and never ships the interactive demo with it.

import type { MouseEvent, ReactNode } from "react";
import { Archive, Heart, Layers, LayoutGrid, Menu, SquareStack, Users } from "@/components/ui/icons";
import type { Variant } from "@/components/features/rules/preview-primitives";
import { destinations, shopTabs } from "./kit/navigation-fixture";
import "./mobile.css";
import "./navigation.css";

const icons = { Home: LayoutGrid, Saved: Heart, Orders: Archive, Account: Users, Shop: SquareStack, Bag: Archive };
export type Tab = keyof typeof icons;

export function Tabs<T extends Tab>({ tabs, selected, onSelect }: {
  tabs: readonly T[]; selected: T; onSelect?: (tab: T, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return <div className="mn-tabbar" role={onSelect ? "group" : undefined} aria-label={onSelect ? "Destinations" : undefined}>
    {tabs.map(tab => {
      const Icon: typeof Archive = icons[tab];
      const label = <><Icon aria-hidden="true" />{tab}</>;
      return onSelect ? <button type="button" className="mn-tab" key={tab} data-receiver={tab} aria-current={selected === tab ? "page" : undefined} onClick={e => onSelect(tab, e)}>{label}</button>
        : <span className="mn-tab" data-active={selected === tab} key={tab}>{label}</span>;
    })}
  </div>;
}

export function Atlas() {
  return <div className="mn-shelf" aria-hidden="true"><div className="mn-book"><b>Pocket<br />atlas</b><Layers /></div></div>;
}

export function NavigationStill({ id, variant }: { id: string; variant: Variant }) {
  const good = variant === "do";
  let content: ReactNode;
  switch (id) {
    case "mobile-7":
      content = <><div className="mn-body"><Atlas /><strong>Home</strong></div>{good ? <Tabs tabs={destinations} selected="Home" /> : <div className="mn-tabbar"><span className="mn-tab"><Menu />Menu</span></div>}</>;
      break;
    case "mobile-8":
      content = <><div className="mn-detail"><small>Back in Shop</small><strong>{good ? "Pocket atlas" : "Catalog"}</strong>{good ? <div className="mn-secret">Product 18 · Returns<br />Return an unused atlas in its original sleeve.</div> : <Atlas />}</div><Tabs tabs={shopTabs} selected="Shop" /></>;
      break;
    case "mobile-9":
      content = good ? <><div className="mn-map"><b className="mn-pin">Fern café</b></div><div className="mn-detail"><small>Selected pin</small><strong>Fern café</strong></div></> : <><div className="mn-body"><strong>Places</strong></div><div className="mn-dialog"><strong>Fern café</strong><p>Café details · 14 Market Lane</p></div></>;
      break;
    case "mobile-10":
      content = <div className="mn-detail"><small>After canceling Back</small><strong>{good ? "Draft" : "Inbox"}</strong>{good ? <div className="mn-secret">See you<span className="mn-caret" aria-hidden="true" /> at the station.</div> : <><div className="mn-listrow">Lin Harper · Row 18</div><div className="mn-listrow">Mara Chen · Row 19</div></>}</div>;
      break;
    default: content = <div className="mn-layout" data-rail={!good}><Tabs tabs={destinations} selected="Saved" /><div className="mn-body"><strong>Saved</strong><Atlas /></div></div>;
  }
  return <div className="mn-still" aria-hidden="true">{content}</div>;
}
