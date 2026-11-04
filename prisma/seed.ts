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
  console.log('🌱 Starting database seed with scholarships...');

  // 1. Seed Universidades
  const uniEafit = await prisma.universidad.upsert({
    where: { nombre: 'Universidad EAFIT' },
    update: {
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      sitioWeb: 'https://www.eafit.edu.co',
      tipo: 'privada',
    },
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
    update: {
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      sitioWeb: 'https://www.upb.edu.co',
      tipo: 'privada',
    },
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
    update: {
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      sitioWeb: 'https://udem.edu.co',
      tipo: 'privada',
    },
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
    update: {
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      sitioWeb: 'https://www.ces.edu.co',
      tipo: 'privada',
    },
    create: {
      nombre: 'Universidad CES',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      sitioWeb: 'https://www.ces.edu.co',
      tipo: 'privada',
    },
  });

  const uniAndes = await prisma.universidad.upsert({
    where: { nombre: 'Universidad de los Andes' },
    update: {
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      sitioWeb: 'https://uniandes.edu.co',
      tipo: 'privada',
    },
    create: {
      nombre: 'Universidad de los Andes',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      sitioWeb: 'https://uniandes.edu.co',
      tipo: 'privada',
    },
  });

  const uniJaveriana = await prisma.universidad.upsert({
    where: { nombre: 'Pontificia Universidad Javeriana' },
    update: {
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      sitioWeb: 'https://www.javeriana.edu.co',
      tipo: 'privada',
    },
    create: {
      nombre: 'Pontificia Universidad Javeriana',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      sitioWeb: 'https://www.javeriana.edu.co',
      tipo: 'privada',
    },
  });

  const uniRosario = await prisma.universidad.upsert({
    where: { nombre: 'Universidad del Rosario' },
    update: {
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      sitioWeb: 'https://urosario.edu.co',
      tipo: 'privada',
    },
    create: {
      nombre: 'Universidad del Rosario',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      sitioWeb: 'https://urosario.edu.co',
      tipo: 'privada',
    },
  });

  const uniExternado = await prisma.universidad.upsert({
    where: { nombre: 'Universidad Externado de Colombia' },
    update: {
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      sitioWeb: 'https://www.uexternado.edu.co',
      tipo: 'privada',
    },
    create: {
      nombre: 'Universidad Externado de Colombia',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      sitioWeb: 'https://www.uexternado.edu.co',
      tipo: 'privada',
    },
  });

  const uniIcesi = await prisma.universidad.upsert({
    where: { nombre: 'Universidad Icesi' },
    update: {
      ciudad: 'Cali',
      departamento: 'Valle del Cauca',
      sitioWeb: 'https://www.icesi.edu.co',
      tipo: 'privada',
    },
    create: {
      nombre: 'Universidad Icesi',
      ciudad: 'Cali',
      departamento: 'Valle del Cauca',
      sitioWeb: 'https://www.icesi.edu.co',
      tipo: 'privada',
    },
  });

  const universityMap: Record<string, string> = {
    'Universidad EAFIT': uniEafit.id,
    'Universidad Pontificia Bolivariana (UPB)': uniUpb.id,
    'Universidad de Medellín': uniUdem.id,
    'Universidad CES': uniCes.id,
    'Universidad de los Andes': uniAndes.id,
    'Pontificia Universidad Javeriana': uniJaveriana.id,
    'Universidad del Rosario': uniRosario.id,
    'Universidad Externado de Colombia': uniExternado.id,
    'Universidad Icesi': uniIcesi.id,
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

  // 3. Load all JSON data files from prisma/data
  const dataDir = path.join(__dirname, 'data');
  const jsonFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));

  const becasList: BecaRaw[] = [];
  for (const file of jsonFiles) {
    const filePath = path.join(dataDir, file);
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(parsed.becas)) {
        becasList.push(...parsed.becas);
        console.log(`📁 Cargadas ${parsed.becas.length} becas desde ${file}`);
      }
    } catch (err) {
      console.error(`Error leyendo ${file}:`, err);
    }
  }

  console.log(`Total de ${becasList.length} becas a procesar.`);

  // Mapping categories helper
  const getCategoriesForBeca = (b: BecaRaw): string[] => {
    const cats: string[] = [];
    const text = `${b.nombre_beca} ${b.descripcion || ''} ${b.requisitos || ''} ${b.poblacion_objetivo || ''}`.toLowerCase();

    if (text.includes('mérito') || text.includes('talento') || text.includes('excelencia') || text.includes('saber 11') || text.includes('preferente')) {
      cats.push('Excelencia Académica');
    }
    if (text.includes('económ') || text.includes('estrato') || text.includes('vulnerab') || text.includes('smlmv') || text.includes('sisbén') || text.includes('social') || text.includes('necesidad')) {
      cats.push('Necesidad Económica');
    }
    if (text.includes('deport')) {
      cats.push('Deporte');
    }
    if (text.includes('indígen') || text.includes('afro') || text.includes('etnia') || text.includes('étnic') || text.includes('etnic') || text.includes('narp') || text.includes('palenqu')) {
      cats.push('Comunidades Étnicas');
    }
    if (text.includes('investiga') || text.includes('doctorado')) {
      cats.push('Investigación');
    }
    if (text.includes('municipio') || text.includes('convenio') || text.includes('fundación') || text.includes('antioquia') || text.includes('alianza') || text.includes('colsubsidio') || text.includes('compensación')) {
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
        fechaActualizacion: b.fecha_actualizacion ? new Date(b.fecha_actualizacion) : null,
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
        fechaActualizacion: b.fecha_actualizacion ? new Date(b.fecha_actualizacion) : null,
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

  console.log(`✅ ${becasList.length} becas creadas/actualizadas exitosamente.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
