'use client';
import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface PdfUploaderProps {
  label: string;
  fieldKey: 'prospectoUrl' | 'packagingUrl';
  currentUrl?: string;
  medId: string;
  onUploaded: (url: string) => void;
  onDeleted: () => void;
}

export default function PdfUploader({ label, fieldKey, currentUrl, medId, onUploaded, onDeleted }: PdfUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Solo se admiten archivos PDF');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('El archivo no puede superar 20 MB');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const storageRef = ref(storage, `medicamentos/${medId}/${fieldKey}.pdf`);
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        'state_changed',
        snap => setProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
        err => { setError('Error al subir: ' + err.message); setUploading(false); },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          onUploaded(url);
          setUploading(false);
          setProgress(0);
        }
      );
    } catch(e) {
      setError('Error: ' + String(e));
      setUploading(false);
    }
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el PDF de ${label}?`)) return;
    onDeleted();
  };

  return (
    <div style={{ border: '1.5px solid var(--bdr)', borderRadius: 'var(--r)', padding: '12px 14px', background: 'var(--bg)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', letterSpacing: 1, fontFamily: 'var(--mono)', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </div>

      {currentUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>PDF cargado ✓</div>
            <a href={currentUrl} target="_blank" rel="noreferrer"
              style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }}>
              Ver PDF →
            </a>
          </div>
          <button type="button" onClick={() => inputRef.current?.click()}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid var(--bdr)', background: 'var(--bg2)', fontSize: 11, fontWeight: 600, color: 'var(--tx2)', cursor: 'pointer' }}>
            Reemplazar
          </button>
          <button type="button" onClick={handleDelete}
            style={{ padding: '4px 10px', borderRadius: 6, border: '1.5px solid #FCA5A5', background: '#FEF2F2', fontSize: 11, fontWeight: 600, color: 'var(--red)', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      ) : (
        <div>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '10px 14px', border: `2px dashed ${uploading ? 'var(--green)' : 'var(--bdr)'}`,
              borderRadius: 'var(--r)', background: uploading ? 'var(--bg3)' : 'var(--bg2)',
              cursor: uploading ? 'wait' : 'pointer', fontSize: 13,
              color: uploading ? 'var(--green)' : 'var(--tx3)',
              justifyContent: 'center', transition: 'all .15s', fontFamily: 'var(--sans)',
            }}>
            <span style={{ fontSize: 18 }}>📎</span>
            {uploading ? `Subiendo... ${progress}%` : `Subir PDF`}
          </button>
          {uploading && (
            <div style={{ marginTop: 6, height: 4, background: 'var(--bdr)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--green)', transition: 'width .3s' }} />
            </div>
          )}
          <p style={{ fontSize: 10, color: 'var(--tx4)', marginTop: 4, textAlign: 'center' }}>
            PDF · máx. 20 MB · se guarda al presionar Guardar
          </p>
        </div>
      )}

      <input ref={inputRef} type="file" accept=".pdf,application/pdf"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }}
        style={{ display: 'none' }} />

      {error && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>{error}</p>}
    </div>
  );
}
