const screenWidth = screen.width;
let rootFontSize;
if (screenWidth <= 320) {
    rootFontSize = ".625rem";
} else if (screenWidth > 320 && screenWidth <= 375) {
    rootFontSize = ".65rem";
} else {
    rootFontSize = ".7rem";
}
document.write(`<style> 
    html {
        font-size: ${rootFontSize};
    }
</style>`)