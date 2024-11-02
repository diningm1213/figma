const getColorScheme = (fillStyleName: string) => {
  const [base, color] = fillStyleName.split("/");

  return color ? color.split(" ")[0].replace(/([a-zA-Z])(\d)/g, "$1-$2") : base;
};

const getTypographyVariant = (textStyleName: string) => {
  const [base, textStyle] = textStyleName.split("/");
  const [size, weight = "", _underline] = textStyle.split("_");
  const weightMap: { [key: string]: string } = {
    regular: "Reg",
    medium: "Med",
    semibold: "Semi",
  };

  const parseBase = base === "Etc" ? "textEtc" : base.toLocaleLowerCase(); // etc는 textEtc로 변경
  const parseWeight =
    base === "Etc" && weight === "semibold" // etc만 semi가 아닌 semibold임
      ? "Semibold"
      : weightMap[weight] || "";

  return `${parseBase}${size}px${parseWeight}`;
};

figma.codegen.on("generate", async ({ node }) => {
  let code = "";
  const tagStack: [number, string][] = [];

  const recursion = async (depth: number, node: SceneNode): Promise<string> => {
    let localCode = "";

    if (node.name === "text") {
      const textNode = node as TextNode;
      const fillStyle = await figma.getStyleByIdAsync(
        textNode.fillStyleId as string
      );
      const textStyle = await figma.getStyleByIdAsync(
        textNode.textStyleId as string
      );

      const fillStyleName = getColorScheme(fillStyle?.name || "");
      const textStyleName = getTypographyVariant(textStyle?.name || "");

      localCode += `${"  ".repeat(
        depth
      )}<Typography variant="${textStyleName}" colorScheme="${fillStyleName}">${
        textNode.characters
      }</Typography>\n`;
    } else if (node.name === "ImageVertical") {
      const instanceNode = node as InstanceNode;
      const { size = "" } = instanceNode.variantProperties || {};

      localCode += `${"  ".repeat(depth)}<Image size="size${size}" src='' />\n`;
    } else if (node.name.includes("Icon/")) {
      const [_, size, iconName] = node.name.split("/");

      localCode += `${"  ".repeat(
        depth
      )}<IconButton size="size${size}x${size}"><Ic${iconName} /></IconButton>\n`;
    } else {
      localCode += `${"  ".repeat(depth)}<${node.name}>\n`;
      tagStack.push([depth, `</${node.name}>`]);
    }

    if ("children" in node) {
      for (const child of node.children) {
        localCode += await recursion(depth + 1, child);
      }
      const poppedTag = tagStack.pop();
      if (poppedTag) {
        const [tagDepth, closeTag] = poppedTag;
        localCode += `${"  ".repeat(tagDepth)}${closeTag}\n`;
      }
    }

    return localCode;
  };

  code = await recursion(0, node);
  while (tagStack.length) {
    const poppedTag = tagStack.pop();
    if (poppedTag) {
      const [tagDepth, closeTag] = poppedTag;
      code += `${"  ".repeat(tagDepth)}${closeTag}\n`;
    }
  }

  return [
    {
      title: "React Component",
      language: "TYPESCRIPT",
      code,
    },
  ];
});
