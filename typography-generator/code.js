"use strict";
// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
// This provides the callback to generate the code.
function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
function rbgToHex(r, g, b) {
    console.log(r, g, b);
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
figma.codegen.on("generate", (event) => {
    let code = "";
    console.log(event);
    if (event.node.type === "TEXT") {
        const node = event.node;
        const fontName = node.fontName;
        const fill = node.fills[0];
        if (fill.type === "SOLID") {
            code = `<Typography type="${fontName.family.toLowerCase()}_${String(node.fontSize)}" weight="${String(node.fontWeight)}" color="${rbgToHex(~~(fill.color.r * 255), ~~(fill.color.g * 255), ~~(fill.color.b * 255)).toUpperCase()}">${node.characters}</Typography>`;
        }
    }
    // const code = `{
    //   type: "${event.node.type}",
    //   name: "${event.node.name}"
    // }`;
    return [
        {
            language: "PLAINTEXT",
            code: code,
            title: "Codegen Plugin",
        },
    ];
});
