"server-only";

import { db } from "@/server/db";
import { sql } from "drizzle-orm";
import { type GetPageOcrResult } from "@/types/ui";

export const getManga = () => db.query.manga.findMany();

export const getPageOcr = async (
  mangaSlug: string,
  volumeNumber: number,
  pageNumber: number,
) => {
  // TODO: when lateral joins are supported, use this Drizzle query instead:
  //
  // const result = await db
  //   .select({
  //     imgWidth: mangaPage.imgWidth,
  //     imgHeight: mangaPage.imgHeight,
  //     blocks: jsonAggBuildObject(getTableColumns(speechBubble), {
  //       notNull: { colName: speechBubble.id },
  //       orderBy: { colName: speechBubble.blockNum, direction: "ASC" },
  //     }),
  //   })
  //   .from(mangaPage)
  //   .innerJoin(manga, eq(manga.id, mangaPage.mangaId))
  //   .leftJoin(speechBubble, eq(speechBubble.mangaPageId, mangaPage.id))
  //   .where(
  //     and(
  //       eq(manga.slug, mangaSlug),
  //       eq(mangaPage.volumeNum, volumeNumber),
  //       eq(mangaPage.pageNum, pageNumber),
  //     ),
  //   )
  //   .groupBy(mangaPage.id, mangaPage.imgWidth, mangaPage.imgHeight);

  const query = await db.execute<GetPageOcrResult>(sql`
    with speech_bubbles as (
      select 
        "manga_page"."manga_id",
        "manga_page"."img_width",
        "manga_page"."img_height",
        "speech_bubble"."id",
        "speech_bubble"."manga_page_id",
        "speech_bubble"."block_num",
        "speech_bubble"."box",
        "speech_bubble"."vertical",
        "speech_bubble"."font_size",
        "speech_bubble"."line_coords",
        "speech_bubble"."lines",
        "speech_bubble"."segmentation",
        "speech_bubble"."kanji"
      from "manga_page"
        inner join "manga" on "manga"."id" = "manga_page"."manga_id"
        left join "speech_bubble" on "speech_bubble"."manga_page_id" = "manga_page"."id"
      where (
        "manga"."slug" = ${mangaSlug}
        and "manga_page"."volume_num" = ${volumeNumber}
        and "manga_page"."page_num" = ${pageNumber}
      )
    ),
    speech_bubble_kanji as (
      select 
          speech_bubbles.id, 
          json_agg(kanji_detail order by kanji_elements.ordinality) as kanji
      from speech_bubbles
      cross join lateral jsonb_array_elements_text(speech_bubbles.kanji) 
      with ordinality as kanji_elements(value, ordinality)
      inner join kanji_detail on kanji_elements.value = kanji_detail.text
      group by speech_bubbles.id
    )
    select 
      s."img_width" as "imgWidth", 
      s."img_height" as "imgHeight",
      coalesce(
        json_agg(
          json_build_object(
            'id',
            s."id",
            'mangaPageId',
            s."manga_page_id",
            'blockNum',
            s."block_num",
            'box',
            s."box",
            'vertical',
            s."vertical",
            'fontSize',
            s."font_size",
            'lineCoords',
            s."line_coords",
            'lines',
            s."lines",
            'segmentation',
            s."segmentation",
            'kanji',
            k.kanji
          ) order by s."block_num" asc
        ) 
        filter (
          where s."id" is not null
        ),
        '[]'
      ) as "blocks"
    from speech_bubbles s
    left join speech_bubble_kanji k on s.id = k.id
    group by s."manga_id", s."img_width", s."img_height";`);

  const result = query.rows;

  if (!result.length) return null;

  console.log(`getPageOcr: ${JSON.stringify(result)}`);

  return result[0];
};
