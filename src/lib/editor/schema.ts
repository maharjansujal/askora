import { Schema, type NodeSpec, type MarkSpec } from "prosemirror-model";

// Inline marks
const marks: Record<string, MarkSpec> = {
  bold: {
    parseDOM: [
      { tag: "strong" },
      {
        tag: "b",
        getAttrs: (node) =>
          (node as HTMLElement).style.fontWeight !== "normal" && null,
      },
      {
        style: "font-weight",
        getAttrs: (value) =>
          value === "bold" || (/^\d+$/.test(value) && Number(value) >= 600)
            ? null
            : false,
      },
    ],
    toDOM: () => ["strong", 0],
  },

  italic: {
    parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
    toDOM: () => ["em", 0],
  },

  code: {
    parseDOM: [{ tag: "code", getAttrs: () => null }],
    toDOM: () => ["code", { class: "rte-inline-code" }, 0],
  },

  link: {
    attrs: { href: {}, title: { default: null } },
    inclusive: false,
    parseDOM: [
      {
        tag: "a[href]",
        getAttrs: (dom) => ({
          href: (dom as HTMLElement).getAttribute("href"),
          title: (dom as HTMLElement).getAttribute("title"),
        }),
      },
    ],
    toDOM: (mark) => [
      "a",
      {
        href: mark.attrs.href as string,
        title: (mark.attrs.title as string) ?? null,
        class: "rte-link",
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      },
      0,
    ],
  },
};

// Block/inline nodes..Mirrors the subset of prosemirror-schema-basic cared about, and lists

const nodes: Record<string, NodeSpec> = {
  doc: {
    content: "block+",
  },

  text: {
    group: "inline",
    inline: true,
  },

  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{ tag: "br" }],
    toDOM: () => ["br"],
  },

  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{ tag: "p" }],
    toDOM: () => ["p", 0],
  },

  heading: {
    attrs: { level: { default: 1 } },
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
    ],
    toDOM: (node) => [`h${node.attrs.level as number}`, 0],
  },

  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "blockquote" }],
    toDOM: () => ["blockquote", 0],
  },

  code_block: {
    content: "text*",
    group: "block",
    code: true,
    defining: true,
    marks: "",
    attrs: { params: { default: "" } },
    parseDOM: [
      {
        tag: "pre",
        preserveWhitespace: "full",
        getAttrs: (node) => {
          const el = node as HTMLElement;
          const code = el.querySelector("code");
          const cls = code?.className ?? "";
          const match = /language-(\S+)/.exec(cls);
          return { params: match ? match[1] : "" };
        },
      },
    ],
    toDOM: (node) => {
      const params = (node.attrs.params as string) ?? "";
      return [
        "pre",
        { class: params ? `language-${params}` : null },
        ["code", 0],
      ];
    },
  },

  bullet_list: {
    content: "list_item+",
    group: "block",
    parseDOM: [{ tag: "ul" }],
    toDOM: () => ["ul", 0],
  },

  ordered_list: {
    content: "list_item+",
    group: "block",
    attrs: { order: { default: 1 } },
    parseDOM: [
      {
        tag: "ol",
        getAttrs: (node) => ({
          order: Number((node as HTMLElement).getAttribute("start")) || 1,
        }),
      },
    ],
    toDOM: (node) => {
      const order = node.attrs.order as number;
      return order === 1 ? ["ol", 0] : ["ol", { start: order }, 0];
    },
  },

  list_item: {
    content: "paragraph block*",
    defining: true,
    parseDOM: [{ tag: "li" }],
    toDOM: () => ["li", 0],
  },

  image: {
    inline: true,
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
    },
    group: "inline",
    draggable: true,
    parseDOM: [
      {
        tag: "img[src]",
        getAttrs: (node) => ({
          src: (node as HTMLElement).getAttribute("src"),
          alt: (node as HTMLElement).getAttribute("alt"),
          title: (node as HTMLElement).getAttribute("title"),
        }),
      },
    ],
    toDOM: (node) => [
      "img",
      {
        src: node.attrs.src as string,
        alt: (node.attrs.alt as string) ?? null,
        title: (node.attrs.title as string) ?? null,
        class: "rte-image",
      },
    ],
  },

  horizontal_rule: {
    group: "block",
    parseDOM: [{ tag: "hr" }],
    toDOM: () => ["hr"],
  },
};

// Single source of truth...both the editor and read-only viewer mount the same schema

export const editorSchema = new Schema({ nodes, marks });
