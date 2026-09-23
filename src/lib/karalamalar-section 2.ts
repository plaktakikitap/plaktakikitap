/**
 * SECTION_NAME — bu bölümün görünen adı.
 * Yeniden adlandırmak için yalnızca burayı değiştirin.
 */
export const SECTION_NAME = "karalamalar";

/** Büyük harfli / nav başlığı */
export const SECTION_TITLE =
  SECTION_NAME.charAt(0).toUpperCase() + SECTION_NAME.slice(1);

/** Public route prefix */
export const SECTION_PATH = `/${SECTION_NAME}`;

/** Admin route */
export const SECTION_ADMIN_PATH = `/secretgate/${SECTION_NAME}`;
