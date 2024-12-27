"server-only";

import { relations } from "drizzle-orm";
import {
  pgTable,
  index,
  foreignKey,
  serial,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";

export const conjSourceReading = pgTable(
  "conj_source_reading",
  {
    id: serial().primaryKey().notNull(),
    conjId: integer("conj_id").notNull(),
    text: text().notNull(),
    sourceText: text("source_text").notNull(),
  },
  (table) => {
    return {
      conjIdTextIdx: index().using(
        "btree",
        table.conjId.asc().nullsLast(),
        table.text.asc().nullsLast(),
      ),
      conjSourceReadingConjugationConjIdForeign: foreignKey({
        columns: [table.conjId],
        foreignColumns: [conjugation.id],
        name: "conj_source_reading_conjugation_conj_id_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const entry = pgTable("entry", {
  seq: integer().primaryKey().notNull(),
  content: text().notNull(),
  rootP: boolean("root_p").notNull(),
  nKanji: integer("n_kanji").notNull(),
  nKana: integer("n_kana").notNull(),
  primaryNokanji: boolean("primary_nokanji").notNull(),
});

export const gloss = pgTable(
  "gloss",
  {
    id: serial().primaryKey().notNull(),
    senseId: integer("sense_id").notNull(),
    text: text().notNull(),
    ord: integer().notNull(),
  },
  (table) => {
    return {
      senseIdIdx: index().using("btree", table.senseId.asc().nullsLast()),
      glossSenseSenseIdForeign: foreignKey({
        columns: [table.senseId],
        foreignColumns: [sense.id],
        name: "gloss_sense_sense_id_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const kanaText = pgTable(
  "kana_text",
  {
    id: serial().primaryKey().notNull(),
    seq: integer().notNull(),
    text: text().notNull(),
    ord: integer().notNull(),
    common: integer(),
    commonTags: text("common_tags").notNull(),
    conjugateP: boolean("conjugate_p").notNull(),
    nokanji: boolean().notNull(),
    bestKanji: text("best_kanji"),
  },
  (table) => {
    return {
      commonIdx: index().using("btree", table.common.asc().nullsLast()),
      ordIdx: index().using("btree", table.ord.asc().nullsLast()),
      seqIdx: index().using("btree", table.seq.asc().nullsLast()),
      textIdx: index().using("btree", table.text.asc().nullsLast()),
      kanaTextEntrySeqForeign: foreignKey({
        columns: [table.seq],
        foreignColumns: [entry.seq],
        name: "kana_text_entry_seq_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const kanjiText = pgTable(
  "kanji_text",
  {
    id: serial().primaryKey().notNull(),
    seq: integer().notNull(),
    text: text().notNull(),
    ord: integer().notNull(),
    common: integer(),
    commonTags: text("common_tags").notNull(),
    conjugateP: boolean("conjugate_p").notNull(),
    nokanji: boolean().notNull(),
    bestKana: text("best_kana"),
  },
  (table) => {
    return {
      commonIdx: index().using("btree", table.common.asc().nullsLast()),
      ordIdx: index().using("btree", table.ord.asc().nullsLast()),
      seqIdx: index().using("btree", table.seq.asc().nullsLast()),
      textIdx: index().using("btree", table.text.asc().nullsLast()),
      kanjiTextEntrySeqForeign: foreignKey({
        columns: [table.seq],
        foreignColumns: [entry.seq],
        name: "kanji_text_entry_seq_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const reading = pgTable(
  "reading",
  {
    id: serial().primaryKey().notNull(),
    kanjiId: integer("kanji_id").notNull(),
    type: text().notNull(),
    text: text().notNull(),
    suffixp: boolean().notNull(),
    prefixp: boolean().notNull(),
    statCommon: integer("stat_common").notNull(),
  },
  (table) => {
    return {
      kanjiIdIdx: index().using("btree", table.kanjiId.asc().nullsLast()),
      statCommonIdx: index().using("btree", table.statCommon.asc().nullsLast()),
      textIdx: index().using("btree", table.text.asc().nullsLast()),
      typeIdx: index().using("btree", table.type.asc().nullsLast()),
      readingKanjiKanjiIdForeign: foreignKey({
        columns: [table.kanjiId],
        foreignColumns: [kanji.id],
        name: "reading_kanji_kanji_id_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const kanji = pgTable(
  "kanji",
  {
    id: serial().primaryKey().notNull(),
    text: text().notNull(),
    radicalC: integer("radical_c").notNull(),
    radicalN: integer("radical_n").notNull(),
    grade: integer(),
    strokes: integer().notNull(),
    freq: integer(),
    statCommon: integer("stat_common").notNull(),
    statIrregular: integer("stat_irregular").notNull(),
  },
  (table) => {
    return {
      freqIdx: index().using("btree", table.freq.asc().nullsLast()),
      gradeIdx: index().using("btree", table.grade.asc().nullsLast()),
      radicalCIdx: index().using("btree", table.radicalC.asc().nullsLast()),
      radicalNIdx: index().using("btree", table.radicalN.asc().nullsLast()),
      statCommonIdx: index().using("btree", table.statCommon.asc().nullsLast()),
      statIrregularIdx: index().using(
        "btree",
        table.statIrregular.asc().nullsLast(),
      ),
      strokesIdx: index().using("btree", table.strokes.asc().nullsLast()),
      textIdx: index().using("btree", table.text.asc().nullsLast()),
    };
  },
);

export const okurigana = pgTable(
  "okurigana",
  {
    id: serial().primaryKey().notNull(),
    readingId: integer("reading_id").notNull(),
    text: text().notNull(),
  },
  (table) => {
    return {
      readingIdIdx: index().using("btree", table.readingId.asc().nullsLast()),
      okuriganaReadingReadingIdForeign: foreignKey({
        columns: [table.readingId],
        foreignColumns: [reading.id],
        name: "okurigana_reading_reading_id_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const conjugation = pgTable(
  "conjugation",
  {
    id: serial().primaryKey().notNull(),
    seq: integer().notNull(),
    from: integer().notNull(),
    via: integer(),
  },
  (table) => {
    return {
      fromIdx: index().using("btree", table.from.asc().nullsLast()),
      seqIdx: index().using("btree", table.seq.asc().nullsLast()),
      conjugationEntryFromForeign: foreignKey({
        columns: [table.from],
        foreignColumns: [entry.seq],
        name: "conjugation_entry_from_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
      conjugationEntrySeqForeign: foreignKey({
        columns: [table.seq],
        foreignColumns: [entry.seq],
        name: "conjugation_entry_seq_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const meaning = pgTable(
  "meaning",
  {
    id: serial().primaryKey().notNull(),
    kanjiId: integer("kanji_id").notNull(),
    text: text().notNull(),
  },
  (table) => {
    return {
      kanjiIdIdx: index().using("btree", table.kanjiId.asc().nullsLast()),
      textIdx: index().using("btree", table.text.asc().nullsLast()),
      meaningKanjiKanjiIdForeign: foreignKey({
        columns: [table.kanjiId],
        foreignColumns: [kanji.id],
        name: "meaning_kanji_kanji_id_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const restrictedReadings = pgTable(
  "restricted_readings",
  {
    id: serial().primaryKey().notNull(),
    seq: integer().notNull(),
    reading: text().notNull(),
    text: text().notNull(),
  },
  (table) => {
    return {
      seqReadingIdx: index().using(
        "btree",
        table.seq.asc().nullsLast(),
        table.reading.asc().nullsLast(),
      ),
      restrictedReadingsEntrySeqForeign: foreignKey({
        columns: [table.seq],
        foreignColumns: [entry.seq],
        name: "restricted_readings_entry_seq_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const conjProp = pgTable(
  "conj_prop",
  {
    id: serial().primaryKey().notNull(),
    conjId: integer("conj_id").notNull(),
    conjType: integer("conj_type").notNull(),
    pos: text().notNull(),
    neg: boolean(),
    fml: boolean(),
  },
  (table) => {
    return {
      conjIdIdx: index().using("btree", table.conjId.asc().nullsLast()),
      conjPropConjugationConjIdForeign: foreignKey({
        columns: [table.conjId],
        foreignColumns: [conjugation.id],
        name: "conj_prop_conjugation_conj_id_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const sense = pgTable(
  "sense",
  {
    id: serial().primaryKey().notNull(),
    seq: integer().notNull(),
    ord: integer().notNull(),
  },
  (table) => {
    return {
      seqIdx: index().using("btree", table.seq.asc().nullsLast()),
      senseEntrySeqForeign: foreignKey({
        columns: [table.seq],
        foreignColumns: [entry.seq],
        name: "sense_entry_seq_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const senseProp = pgTable(
  "sense_prop",
  {
    id: serial().primaryKey().notNull(),
    tag: text().notNull(),
    senseId: integer("sense_id").notNull(),
    text: text().notNull(),
    ord: integer().notNull(),
    seq: integer().notNull(),
  },
  (table) => {
    return {
      senseIdTagIdx: index().using(
        "btree",
        table.senseId.asc().nullsLast(),
        table.tag.asc().nullsLast(),
      ),
      seqTagTextIdx: index().using(
        "btree",
        table.seq.asc().nullsLast(),
        table.tag.asc().nullsLast(),
        table.text.asc().nullsLast(),
      ),
      tagTextIdx: index().using(
        "btree",
        table.tag.asc().nullsLast(),
        table.text.asc().nullsLast(),
      ),
      sensePropEntrySeqForeign: foreignKey({
        columns: [table.seq],
        foreignColumns: [entry.seq],
        name: "sense_prop_entry_seq_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
      sensePropSenseSenseIdForeign: foreignKey({
        columns: [table.senseId],
        foreignColumns: [sense.id],
        name: "sense_prop_sense_sense_id_foreign",
      })
        .onUpdate("restrict")
        .onDelete("cascade"),
    };
  },
);

export const conjSourceReadingRelations = relations(
  conjSourceReading,
  ({ one }) => ({
    conjugation: one(conjugation, {
      fields: [conjSourceReading.conjId],
      references: [conjugation.id],
    }),
  }),
);

export const conjugationRelations = relations(conjugation, ({ one, many }) => ({
  conjSourceReadings: many(conjSourceReading),
  entry_from: one(entry, {
    fields: [conjugation.from],
    references: [entry.seq],
    relationName: "conjugation_from_entry_seq",
  }),
  entry_seq: one(entry, {
    fields: [conjugation.seq],
    references: [entry.seq],
    relationName: "conjugation_seq_entry_seq",
  }),
  conjProps: many(conjProp),
}));

export const glossRelations = relations(gloss, ({ one }) => ({
  sense: one(sense, {
    fields: [gloss.senseId],
    references: [sense.id],
  }),
}));

export const senseRelations = relations(sense, ({ one, many }) => ({
  glosses: many(gloss),
  entry: one(entry, {
    fields: [sense.seq],
    references: [entry.seq],
  }),
  senseProps: many(senseProp),
}));

export const kanaTextRelations = relations(kanaText, ({ one }) => ({
  entry: one(entry, {
    fields: [kanaText.seq],
    references: [entry.seq],
  }),
}));

export const entryRelations = relations(entry, ({ many }) => ({
  kanaTexts: many(kanaText),
  kanjiTexts: many(kanjiText),
  conjugations_from: many(conjugation, {
    relationName: "conjugation_from_entry_seq",
  }),
  conjugations_seq: many(conjugation, {
    relationName: "conjugation_seq_entry_seq",
  }),
  restrictedReadings: many(restrictedReadings),
  senses: many(sense),
  senseProps: many(senseProp),
}));

export const kanjiTextRelations = relations(kanjiText, ({ one }) => ({
  entry: one(entry, {
    fields: [kanjiText.seq],
    references: [entry.seq],
  }),
}));

export const readingRelations = relations(reading, ({ one, many }) => ({
  kanji: one(kanji, {
    fields: [reading.kanjiId],
    references: [kanji.id],
  }),
  okuriganas: many(okurigana),
}));

export const kanjiRelations = relations(kanji, ({ many }) => ({
  readings: many(reading),
  meanings: many(meaning),
}));

export const okuriganaRelations = relations(okurigana, ({ one }) => ({
  reading: one(reading, {
    fields: [okurigana.readingId],
    references: [reading.id],
  }),
}));

export const meaningRelations = relations(meaning, ({ one }) => ({
  kanji: one(kanji, {
    fields: [meaning.kanjiId],
    references: [kanji.id],
  }),
}));

export const restrictedReadingsRelations = relations(
  restrictedReadings,
  ({ one }) => ({
    entry: one(entry, {
      fields: [restrictedReadings.seq],
      references: [entry.seq],
    }),
  }),
);

export const conjPropRelations = relations(conjProp, ({ one }) => ({
  conjugation: one(conjugation, {
    fields: [conjProp.conjId],
    references: [conjugation.id],
  }),
}));

export const sensePropRelations = relations(senseProp, ({ one }) => ({
  entry: one(entry, {
    fields: [senseProp.seq],
    references: [entry.seq],
  }),
  sense: one(sense, {
    fields: [senseProp.senseId],
    references: [sense.id],
  }),
}));
