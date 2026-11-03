import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BecaRaw {
  id_beca: string;
  universidad: string;
  municipio_aplicacion: string | null;
  nombre_beca: string;
  nivel_academico: string | null;
  area_conocimiento: string | null;
  modalidad: string | null;
  descripcion: string | null;
  tipo_financiacion: string | null;
  porcentaje: string | null;
  valor_beca_cop: number | null;
  cobertura: string | null;
  edad_minima: number | null;
  edad_maxima: number | null;
  promedio_minimo: number | null;
  estrato_socioeconomico: string | null;
  poblacion_objetivo: string | null;
  requisitos: string | null;
  documentos_requeridos: string | null;
  fecha_apertura: string | null;
  fecha_cierre: string | null;
  estado_convocatoria: string | null;
  enlace_oficial: string | null;
  fecha_actualizacion: string | null;
  estado_calidad_dato: string | null;
  observaciones: string | null;
}

async function main() {
  console.log('🌱 Starting database seed with new scholarships schema...');

  // 1. Seed Universidades
  const uniEafit = await prisma.universidad.upsert({
    where: { nombre: 'Universidad EAFIT' },
    update: {},
    create: {
      nombre: 'Universidad EAFIT',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      sitioWeb: 'https://www.eafit.edu.co',
      tipo: 'privada',
    },
  });

  const uniUpb = await prisma.universidad.upsert({
    where: { nombre: 'Universidad Pontificia Bolivariana (UPB)' },
    update: {},
    create: {
      nombre: 'Universidad Pontificia Bolivariana (UPB)',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      sitioWeb: 'https://www.upb.edu.co',
      tipo: 'privada',
    },
  });

  const uniUdem = await prisma.universidad.upsert({
    where: { nombre: 'Universidad de Medellín' },
    update: {},
    create: {
      nombre: 'Universidad de Medellín',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      sitioWeb: 'https://udem.edu.co',
      tipo: 'privada',
    },
  });

  const uniCes = await prisma.universidad.upsert({
    where: { nombre: 'Universidad CES' },
    update: {},
    create: {
      nombre: 'Universidad CES',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      sitioWeb: 'https://www.ces.edu.co',
      tipo: 'privada',
    },
  });

  const universityMap: Record<string, string> = {
    'Universidad EAFIT': uniEafit.id,
    'Universidad Pontificia Bolivariana (UPB)': uniUpb.id,
    'Universidad de Medellín': uniUdem.id,
    'Universidad CES': uniCes.id,
  };

  // 2. Seed Categorías
  const categoriasData = [
    { nombre: 'Excelencia Académica', descripcion: 'Por alto rendimiento o mérito académico' },
    { nombre: 'Necesidad Económica', descripcion: 'Apoyo para estratos 1, 2, 3 o vulnerabilidad económica' },
    { nombre: 'Deporte', descripcion: 'Para deportistas destacados o de alto rendimiento' },
    { nombre: 'Comunidades Étnicas', descripcion: 'Pueblos indígenas y comunidades afrocolombianas' },
    { nombre: 'Investigación', descripcion: 'Posgrados de investigación y maestrías' },
    { nombre: 'Alianzas Regionales', descripcion: 'Convenios municipales o departamentales' },
  ];

  const catMap = new Map<string, string>();
  for (const cat of categoriasData) {
    const created = await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    });
    catMap.set(cat.nombre, created.id);
  }

  // 3. Load JSON data
  const jsonPath = path.join(__dirname, 'data', 'becas_medellin.json');
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const becasList: BecaRaw[] = rawData.becas;

  console.log(`Encontradas ${becasList.length} becas en el archivo.`);

  // Mapping categories helper
  const getCategoriesForBeca = (b: BecaRaw): string[] => {
    const cats: string[] = [];
    const text = `${b.nombre_beca} ${b.descripcion || ''} ${b.requisitos || ''} ${b.poblacion_objetivo || ''}`.toLowerCase();

    if (text.includes('mérito') || text.includes('talento') || text.includes('excelencia') || text.includes('saber 11')) {
      cats.push('Excelencia Académica');
    }
    if (text.includes('económ') || text.includes('estrato') || text.includes('vulnerab') || text.includes('smlmv') || text.includes('sisbén') || text.includes('social')) {
      cats.push('Necesidad Económica');
    }
    if (text.includes('deport')) {
      cats.push('Deporte');
    }
    if (text.includes('indígen') || text.includes('afro') || text.includes('etnia')) {
      cats.push('Comunidades Étnicas');
    }
    if (text.includes('investiga') || text.includes('doctorado')) {
      cats.push('Investigación');
    }
    if (text.includes('municipio') || text.includes('convenio') || text.includes('fundación') || text.includes('antioquia')) {
      cats.push('Alianzas Regionales');
    }

    if (cats.length === 0) cats.push('Excelencia Académica');
    return cats;
  };

  for (const b of becasList) {
    const uniId = universityMap[b.universidad] || null;

    const fechaAperturaDate = b.fecha_apertura ? new Date(b.fecha_apertura) : null;
    const fechaCierreDate = b.fecha_cierre ? new Date(b.fecha_cierre) : null;

    await prisma.beca.upsert({
      where: { idBeca: b.id_beca },
      update: {
        universidad: b.universidad,
        universidadId: uniId,
        municipioAplicacion: b.municipio_aplicacion,
        nombreBeca: b.nombre_beca,
        nivelAcademico: b.nivel_academico,
        areaConocimiento: b.area_conocimiento,
        modalidad: b.modalidad,
        descripcion: b.descripcion,
        tipoFinanciacion: b.tipo_financiacion,
        porcentaje: b.porcentaje,
        valorBecaCop: b.valor_beca_cop,
        cobertura: b.cobertura,
        edadMinima: b.edad_minima,
        edadMaxima: b.edad_maxima,
        promedioMinimo: b.promedio_minimo,
        estratoSocioeconomico: b.estrato_socioeconomico,
        poblacionObjetivo: b.poblacion_objetivo,
        requisitos: b.requisitos,
        documentosRequeridos: b.documentos_requeridos,
        fechaApertura: fechaAperturaDate,
        fechaCierre: fechaCierreDate,
        estadoConvocatoria: b.estado_convocatoria,
        enlaceOficial: b.enlace_oficial,
        fechaActualizacion: null,
        estadoCalidadDato: b.estado_calidad_dato,
        observaciones: b.observaciones,
      },
      create: {
        id: b.id_beca,
        idBeca: b.id_beca,
        universidad: b.universidad,
        universidadId: uniId,
        municipioAplicacion: b.municipio_aplicacion,
        nombreBeca: b.nombre_beca,
        nivelAcademico: b.nivel_academico,
        areaConocimiento: b.area_conocimiento,
        modalidad: b.modalidad,
        descripcion: b.descripcion,
        tipoFinanciacion: b.tipo_financiacion,
        porcentaje: b.porcentaje,
        valorBecaCop: b.valor_beca_cop,
        cobertura: b.cobertura,
        edadMinima: b.edad_minima,
        edadMaxima: b.edad_maxima,
        promedioMinimo: b.promedio_minimo,
        estratoSocioeconomico: b.estrato_socioeconomico,
        poblacionObjetivo: b.poblacion_objetivo,
        requisitos: b.requisitos,
        documentosRequeridos: b.documentos_requeridos,
        fechaApertura: fechaAperturaDate,
        fechaCierre: fechaCierreDate,
        estadoConvocatoria: b.estado_convocatoria,
        enlaceOficial: b.enlace_oficial,
        fechaActualizacion: null,
        estadoCalidadDato: b.estado_calidad_dato,
        observaciones: b.observaciones,
      },
    });

    // Conectar categorías
    const cats = getCategoriesForBeca(b);
    for (const catName of cats) {
      const catId = catMap.get(catName);
      if (catId) {
        await prisma.becaCategoria.upsert({
          where: {
            becaId_categoriaId: {
              becaId: b.id_beca,
              categoriaId: catId,
            },
          },
          update: {},
          create: {
            becaId: b.id_beca,
            categoriaId: catId,
          },
        });
      }
    }
  }

  console.log(` ${becasList.length} becas creadas exitosamente.`);
}

main()
  .catch((e) => {
    console.error(' Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
