import { PDFDocument, AFRelationship } from "pdf-lib";

/**
 * Embeds a Factur-X XML file into a PDF to produce a PDF/A-3 hybrid.
 * The embedded file uses AFRelationship.Data per the Factur-X spec (§4.2).
 */
export async function embedFacturX(pdfBytes: Buffer, xmlBytes: Buffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);

  await doc.attach(xmlBytes, "factur-x.xml", {
    mimeType: "application/xml",
    description: "Factur-X EXTENDED",
    creationDate: new Date(),
    modificationDate: new Date(),
    afRelationship: AFRelationship.Data,
  });

  /* XMP metadata required for PDF/A-3 conformance */
  const xmpMeta = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#">
      <fx:DocumentFileName>factur-x.xml</fx:DocumentFileName>
      <fx:DocumentType>INVOICE</fx:DocumentType>
      <fx:Version>1.0</fx:Version>
      <fx:ConformanceLevel>EN 16931</fx:ConformanceLevel>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  doc.setSubject("urn:factur-x.eu:1p0:en16931");
  doc.setKeywords(["Factur-X", "EN 16931", "CII", "e-invoice"]);

  const context = doc.context;
  const metaStream = context.flateStream(
    new TextEncoder().encode(xmpMeta),
    { Type: "Metadata", Subtype: "XML" }
  );
  const metaRef = context.register(metaStream);
  doc.catalog.set(context.obj("Metadata"), metaRef);

  return doc.save();
}
