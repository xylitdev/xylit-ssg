export const Text = 1;
export const BeforeTagName = 2; // After <
export const InTagName = 3;
export const InSelfClosingTag = 4;
export const BeforeClosingTagName = 5;
export const InClosingTagName = 6;
export const AfterClosingTagName = 7;

// Attributes
export const BeforeAttributeName = 8;
export const InAttributeName = 9;
export const AfterAttributeName = 10;
export const BeforeAttributeValue = 11;
export const InAttributeValueDq = 12; // "
export const InAttributeValueSq = 13; // '
export const InAttributeValueNq = 14;

// Declarations
export const BeforeDeclaration = 15; // !
export const InDeclaration = 16;

// Processing instructions
export const InProcessingInstruction = 17; // ?

// Comments & CDATA
export const BeforeComment = 18;
export const CDATASequence = 19;
export const InSpecialComment = 20;
export const InCommentLike = 21;

// Special tags
export const BeforeSpecialS = 22; // Decide if we deal with `<script` or `<style`
export const BeforeSpecialT = 23; // Decide if we deal with `<title` or `<textarea`
export const SpecialStartSequence = 24;
export const InSpecialTag = 25;
export const InEntity = 26;
