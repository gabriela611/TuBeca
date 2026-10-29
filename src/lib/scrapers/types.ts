/**
 * Tipos compartidos para todos los scrapers de TuBeca.
 * Cada scraper debe retornar un array de RawScholarship.
 */

/** Datos crudos extraídos de un sitio web antes de normalizar */
export interface RawScholarship {
  titulo: string;
  descripcion: string;
  url: string;
  universidad?: string;
  ciudad?: string;
  departamento?: string;
  tipo?: string;
  modalidad?: string;
  cobertura?: string;
  porcentajeCobertura?: number;
  fechaInicio?: string;
  fechaCierre?: string;
  requisitos?: string;
}

/** Datos normalizados listos para guardar en la BD */
export interface NormalizedScholarship {
  titulo: string;
  descripcion: string;
  universidadNombre?: string;
  ciudad?: string;
  departamento?: string;
  tipo: 'pregrado' | 'posgrado' | 'doctorado' | 'tecnico';
  modalidad?: 'presencial' | 'virtual' | 'hibrida';
  cobertura?: 'total' | 'parcial';
  porcentajeCobertura?: number;
  fechaInicio?: Date;
  fechaCierre?: Date;
  requisitos?: string;
  urlOriginal: string;
  fuente: string;
  estado: 'activa' | 'vencida' | 'proxima';
}

/** Resultado de la ejecución de un scraper */
export interface ScraperResult {
  fuente: string;
  success: boolean;
  scholarships: RawScholarship[];
  error?: string;
  duration: number; // ms
}

/** Interfaz que todo scraper debe implementar */
export interface Scraper {
  name: string;
  fuente: string;
  scrape(): Promise<RawScholarship[]>;
}
