// design-system: strict
import { GalleryWall } from "@/components/gallery/gallery-wall";
import { CATALOG_BASE } from "@/lib/navigation/routes";

/**
 * The wall, server-rendered at the gallery URL only; every other catalog URL
 * renders the slot's default (nothing). CatalogApp's one delegated listener
 * opens its tiles.
 */
export default function Wall() {
  return <GalleryWall base={CATALOG_BASE} />;
}
