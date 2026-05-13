import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

function escapeXml(str: string): string {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function formatDate(iso: string): string {
  // E2B format: YYYYMMDD
  return (iso || '').replace(/-/g,'').slice(0,8);
}

function buildE2B(rep: any): string {
  const now = new Date();
  const msgDate = now.toISOString().replace(/[-:T]/g,'').slice(0,14);
  const reportId = `SIMI-EC-${Date.now()}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ichicsr SYSTEM "ich-icsr-v3-0.dtd">
<ichicsr lang="es" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:noNamespaceSchemaLocation="ich-icsr-v3-0.xsd">
  <ichicsrmessageheader>
    <messagetype>ichicsr</messagetype>
    <messageformatversion>3.0</messageformatversion>
    <messageformatrelease>1</messageformatrelease>
    <messagenumb>${escapeXml(reportId)}</messagenumb>
    <messagesenderidentifier>SIMI-ECUADOR</messagesenderidentifier>
    <messagereceiveridentifier>WHO-VIGIBASE</messagereceiveridentifier>
    <messagedateformat>204</messagedateformat>
    <messagedate>${msgDate}</messagedate>
  </ichicsrmessageheader>
  <safetyreport>
    <safetyreportversion>1</safetyreportversion>
    <safetyreportid>${escapeXml(reportId)}</safetyreportid>
    <primarysourcecountry>EC</primarysourcecountry>
    <occurcountry>EC</occurcountry>
    <transmissiondateformat>102</transmissiondateformat>
    <transmissiondate>${formatDate(rep.fechaReporte)}</transmissiondate>
    <reporttype>${rep.tipo === 'RAM' ? '1' : rep.tipo === 'FT' ? '2' : '3'}</reporttype>
    <serious>${rep.rams?.some((r: any) => r.gravedad === 'grave' || r.gravedad === 'mortal') ? '1' : '2'}</serious>
    ${rep.rams?.some((r: any) => r.gravedad === 'mortal') ? '<seriousnesslifethreatening>1</seriousnesslifethreatening>' : ''}
    ${rep.rams?.some((r: any) => r.gravedad === 'mortal') ? '<seriousnessdeath>1</seriousnessdeath>' : ''}
    ${rep.rams?.some((r: any) => r.gravedad === 'grave') ? '<seriousnesshospitalization>1</seriousnesshospitalization>' : ''}
    <receivedateformat>102</receivedateformat>
    <receivedate>${formatDate(rep.fechaReporte)}</receivedate>
    <receiptdateformat>102</receiptdateformat>
    <receiptdate>${formatDate(rep.fechaReporte)}</receiptdate>
    <additionaldocument>2</additionaldocument>
    <fulfillexpeditecriteria>2</fulfillexpeditecriteria>
    <authoritynumb>${escapeXml(rep.medicamentoRS || '')}</authoritynumb>
    <companynumb>${escapeXml(reportId)}</companynumb>

    <!-- Fuente primaria / Notificador -->
    <primarysource>
      <reportertitle>${escapeXml(rep.notificadorProfesion || '')}</reportertitle>
      <reporterfamilyname>${escapeXml(rep.notificadorNombre || '')}</reporterfamilyname>
      <reporterorganization>${escapeXml(rep.notificadorInstitucion || '')}</reporterorganization>
      <reportercountry>EC</reportercountry>
      <qualification>${
        rep.notificadorProfesion?.includes('Médico') ? '1' :
        rep.notificadorProfesion?.includes('Farmacéutico') ? '3' :
        rep.notificadorProfesion?.includes('Enfermero') ? '4' : '5'
      }</qualification>
    </primarysource>

    <!-- Paciente -->
    <patient>
      <patientinitial>${escapeXml(rep.pacienteInicialesNombre || 'ANON')}</patientinitial>
      ${rep.pacienteEdad ? `<patientonsetage>${escapeXml(rep.pacienteEdad)}</patientonsetage>` : ''}
      ${rep.pacienteEdadUnidad ? `<patientonsetageunit>${rep.pacienteEdadUnidad === 'años' ? '801' : rep.pacienteEdadUnidad === 'meses' ? '802' : '804'}</patientonsetageunit>` : ''}
      ${rep.pacienteSexo ? `<patientsex>${rep.pacienteSexo === 'M' ? '1' : rep.pacienteSexo === 'F' ? '2' : '0'}</patientsex>` : ''}
      ${rep.pacientePeso ? `<patientweight>${escapeXml(rep.pacientePeso)}</patientweight>` : ''}

      <!-- Medicamento sospechoso -->
      <drug>
        <drugcharacterization>1</drugcharacterization>
        <medicinalproduct>${escapeXml(rep.medicamentoSospechoso || '')}</medicinalproduct>
        ${rep.medicamentoRS ? `<drugauthorizationnumb>${escapeXml(rep.medicamentoRS)}</drugauthorizationnumb>` : ''}
        <drugauthorizationcountry>EC</drugauthorizationcountry>
        <drugauthorizationholder>${escapeXml(rep.laboratorio || '')}</drugauthorizationholder>
        ${rep.medicamentoDosis ? `<drugdosagetext>${escapeXml(rep.medicamentoDosis)}</drugdosagetext>` : ''}
        ${rep.medicamentoVia ? `<drugroute>${escapeXml(rep.medicamentoVia)}</drugroute>` : ''}
        ${rep.medicamentoFechaInicio ? `<drugstartdateformat>102</drugstartdateformat><drugstartdate>${formatDate(rep.medicamentoFechaInicio)}</drugstartdate>` : ''}
        ${rep.medicamentoFechaFin ? `<drugenddateformat>102</drugenddateformat><drugenddate>${formatDate(rep.medicamentoFechaFin)}</drugenddate>` : ''}
        <drugindication>${escapeXml(rep.medicamentoIndicacion || '')}</drugindication>
        <actiondrug>${
          rep.accionTomada === 'suspendido' ? '1' :
          rep.accionTomada === 'dosis_reducida' ? '2' :
          rep.accionTomada === 'sin_cambios' ? '4' : '6'
        }</actiondrug>
        <drugrecurreadministration>${
          rep.reexposicion === 'si_reaparece' ? '1' :
          rep.reexposicion === 'si_no_reaparece' ? '2' :
          rep.reexposicion === 'no' ? '3' : '3'
        }</drugrecurreadministration>
      </drug>

      ${rep.medicamentosConcomitantes ? `
      <!-- Medicamentos concomitantes -->
      <drug>
        <drugcharacterization>2</drugcharacterization>
        <medicinalproduct>${escapeXml(rep.medicamentosConcomitantes)}</medicinalproduct>
      </drug>` : ''}

      <!-- Reacciones adversas MedDRA -->
      ${(rep.rams || []).map((r: any) => `
      <reaction>
        <primarysourcereaction>${escapeXml(r.ptTerm || '')}</primarysourcereaction>
        <reactionmeddraversionllt>24.1</reactionmeddraversionllt>
        <reactionmeddrallt>${escapeXml(r.ptTerm || '')}</reactionmeddrallt>
        <reactionmeddrapt>${escapeXml(r.ptTerm || '')}</reactionmeddrapt>
        ${r.fechaInicio ? `<reactionstartdateformat>102</reactionstartdateformat><reactionstartdate>${formatDate(r.fechaInicio)}</reactionstartdate>` : ''}
        ${r.fechaFin ? `<reactionenddateformat>102</reactionenddateformat><reactionenddate>${formatDate(r.fechaFin)}</reactionenddate>` : ''}
        <reactionoutcome>${
          rep.desenlace === 'recuperado' ? '1' :
          rep.desenlace === 'recuperando' ? '2' :
          rep.desenlace === 'no_recuperado' ? '3' :
          rep.desenlace === 'secuela' ? '4' :
          rep.desenlace === 'fallecido' ? '5' : '6'
        }</reactionoutcome>
      </reaction>`).join('\n')}

      ${rep.icd11Code ? `
      <!-- Diagnóstico ICD-11 OMS -->
      <patientmedicalhistoryepisode>
        <patientepisodename>${escapeXml(rep.icd11Term || '')}</patientepisodename>
        <patientepisodenamemeddraversion>ICD-11-2024</patientepisodenamemeddraversion>
      </patientmedicalhistoryepisode>` : ''}

      <!-- Evaluación de causalidad -->
      <summary>
        <narrativeincludeclinical>${escapeXml(rep.informacionAdicional || '')}</narrativeincludeclinical>
        <sendercomment>Causalidad: ${escapeXml(rep.causalidad || '')}${rep.icd11Code ? ` | Diagnóstico ICD-11: ${escapeXml(rep.icd11Code)} ${escapeXml(rep.icd11Term)}` : ''} | Sistema: SIMI Ecuador v2 | Estándar: ICH E2B(R3) 2024 | MedDRA v27.0 | VigiBase WHO-UMC</sendercomment>
      </summary>
    </patient>
  </safetyreport>
</ichicsr>`;

  return xml;
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    let rep: any;
    if (id) {
      const doc = await adminDb.collection('farmacovigilancia_reportes').doc(id).get();
      if (!doc.exists) return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
      rep = doc.data();
    } else {
      // Demo con datos de prueba
      rep = {
        tipo: 'RAM', fechaReporte: new Date().toISOString().split('T')[0],
        notificadorNombre: 'Demo SIMI', notificadorProfesion: 'Médico/a',
        notificadorInstitucion: 'SIMI Ecuador',
        pacienteInicialesNombre: 'TEST', pacienteSexo: 'M', pacienteEdad: '45', pacienteEdadUnidad: 'años',
        medicamentoSospechoso: 'Minart AM 16+2.5mg', medicamentoRS: '2967-MEE-0817',
        medicamentoDosis: '16+2.5mg cada 24h', medicamentoVia: 'oral',
        medicamentoIndicacion: 'Hipertensión arterial',
        rams: [{ ptCode: '10019211', ptTerm: 'Cefalea', gravedad: 'leve', fechaInicio: '', fechaFin: '' }],
        causalidad: 'posible', desenlace: 'recuperando',
        accionTomada: 'sin_cambios', reexposicion: 'desconocido', informacionAdicional: '',
        icd11Code: 'BA00', icd11Term: 'Hipertensión esencial',
      };
    }

    const xml = buildE2B(rep);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="E2B_SIMI_${Date.now()}.xml"`,
      },
    });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rep = await req.json();
    const xml = buildE2B(rep);
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="E2B_SIMI_${Date.now()}.xml"`,
      },
    });
  } catch(e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
