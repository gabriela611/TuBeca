import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Universidades ---
  const universidades = await Promise.all([
    prisma.universidad.upsert({
      where: { nombre: 'Universidad de los Andes' },
      update: {},
      create: {
        nombre: 'Universidad de los Andes',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        sitioWeb: 'https://uniandes.edu.co',
        tipo: 'privada',
      },
    }),
    prisma.universidad.upsert({
      where: { nombre: 'Universidad Nacional de Colombia' },
      update: {},
      create: {
        nombre: 'Universidad Nacional de Colombia',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        sitioWeb: 'https://unal.edu.co',
        tipo: 'publica',
      },
    }),
    prisma.universidad.upsert({
      where: { nombre: 'Universidad de Antioquia' },
      update: {},
      create: {
        nombre: 'Universidad de Antioquia',
        ciudad: 'Medellín',
        departamento: 'Antioquia',
        sitioWeb: 'https://udea.edu.co',
        tipo: 'publica',
      },
    }),
    prisma.universidad.upsert({
      where: { nombre: 'Universidad del Norte' },
      update: {},
      create: {
        nombre: 'Universidad del Norte',
        ciudad: 'Barranquilla',
        departamento: 'Atlántico',
        sitioWeb: 'https://uninorte.edu.co',
        tipo: 'privada',
      },
    }),
    prisma.universidad.upsert({
      where: { nombre: 'Pontificia Universidad Javeriana' },
      update: {},
      create: {
        nombre: 'Pontificia Universidad Javeriana',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        sitioWeb: 'https://javeriana.edu.co',
        tipo: 'privada',
      },
    }),
    prisma.universidad.upsert({
      where: { nombre: 'Universidad EAFIT' },
      update: {},
      create: {
        nombre: 'Universidad EAFIT',
        ciudad: 'Medellín',
        departamento: 'Antioquia',
        sitioWeb: 'https://eafit.edu.co',
        tipo: 'privada',
      },
    }),
    prisma.universidad.upsert({
      where: { nombre: 'Universidad del Rosario' },
      update: {},
      create: {
        nombre: 'Universidad del Rosario',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        sitioWeb: 'https://urosario.edu.co',
        tipo: 'privada',
      },
    }),
    prisma.universidad.upsert({
      where: { nombre: 'Universidad del Valle' },
      update: {},
      create: {
        nombre: 'Universidad del Valle',
        ciudad: 'Cali',
        departamento: 'Valle del Cauca',
        sitioWeb: 'https://univalle.edu.co',
        tipo: 'publica',
      },
    }),
  ]);

  console.log(`✅ ${universidades.length} universidades creadas`);

  // --- Categorías ---
  const categorias = await Promise.all([
    prisma.categoria.upsert({
      where: { nombre: 'Mérito Académico' },
      update: {},
      create: { nombre: 'Mérito Académico', descripcion: 'Becas otorgadas por excelencia académica' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Necesidad Económica' },
      update: {},
      create: { nombre: 'Necesidad Económica', descripcion: 'Becas basadas en la situación económica del estudiante' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Deportiva' },
      update: {},
      create: { nombre: 'Deportiva', descripcion: 'Becas para deportistas destacados' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Investigación' },
      update: {},
      create: { nombre: 'Investigación', descripcion: 'Becas para proyectos de investigación' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Comunidades Étnicas' },
      update: {},
      create: { nombre: 'Comunidades Étnicas', descripcion: 'Becas para comunidades indígenas, afrodescendientes y ROM' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Internacional' },
      update: {},
      create: { nombre: 'Internacional', descripcion: 'Becas para estudios en el exterior' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Víctimas del Conflicto' },
      update: {},
      create: { nombre: 'Víctimas del Conflicto', descripcion: 'Becas para víctimas del conflicto armado' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Mujer en STEM' },
      update: {},
      create: { nombre: 'Mujer en STEM', descripcion: 'Becas para mujeres en ciencias, tecnología, ingeniería y matemáticas' },
    }),
  ]);

  console.log(`✅ ${categorias.length} categorías creadas`);

  // --- Becas de ejemplo (datos manuales reales) ---
  const [uniandes, unal, udea, uninorte, javeriana, eafit, rosario, univalle] = universidades;
  const [merito, necesidad, deportiva, investigacion, etnicas, internacional, victimas, mujerStem] = categorias;

  const becas = [
    {
      titulo: 'Quiero Estudiar - Uniandes',
      descripcion:
        'Programa de becas que cubre del 50% al 95% de la matrícula para estudiantes de pregrado con excelente rendimiento académico y necesidad económica demostrada. Incluye apoyo para sostenimiento.',
      universidadId: uniandes.id,
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      tipo: 'pregrado',
      modalidad: 'presencial',
      cobertura: 'parcial',
      porcentajeCobertura: 90,
      fechaInicio: new Date('2027-01-15'),
      fechaCierre: new Date('2027-03-30'),
      requisitos:
        'Puntaje ICFES en el top 10% nacional. Estrato socioeconómico 1, 2 o 3. Ser admitido a un programa de pregrado.',
      urlOriginal: 'https://uniandes.edu.co/becas/quiero-estudiar',
      fuente: 'manual',
      estado: 'proxima',
      categoriaIds: [merito.id, necesidad.id],
    },
    {
      titulo: 'Beca Ser Pilo Paga - ICETEX',
      descripcion:
        'Crédito-beca condonable que cubre el 100% de la matrícula en universidades acreditadas de alta calidad. El crédito se condona al graduarse en el tiempo estipulado.',
      ciudad: 'Nacional',
      departamento: 'Todos',
      tipo: 'pregrado',
      modalidad: 'presencial',
      cobertura: 'total',
      porcentajeCobertura: 100,
      fechaInicio: new Date('2027-02-01'),
      fechaCierre: new Date('2027-04-15'),
      requisitos:
        'Puntaje Saber 11 en el top 10%. Pertenecer al SISBEN. Ser admitido en una IES acreditada.',
      urlOriginal: 'https://portal.icetex.gov.co/becas/ser-pilo-paga',
      fuente: 'icetex',
      estado: 'proxima',
      categoriaIds: [merito.id, necesidad.id],
    },
    {
      titulo: 'Beca Generación E - Componente de Equidad',
      descripcion:
        'Programa del gobierno nacional que subsidia el valor de la matrícula en universidades públicas para jóvenes en condición de vulnerabilidad económica.',
      ciudad: 'Nacional',
      departamento: 'Todos',
      tipo: 'pregrado',
      modalidad: 'presencial',
      cobertura: 'total',
      porcentajeCobertura: 100,
      fechaInicio: new Date('2027-01-10'),
      fechaCierre: new Date('2027-03-01'),
      requisitos:
        'Estar registrado en el SISBEN. Haber sido admitido en una IES pública acreditada. No tener otro beneficio de financiamiento.',
      urlOriginal: 'https://www.mineducacion.gov.co/portal/micrositios-institucionales/Generacion-E/',
      fuente: 'mineducacion',
      estado: 'proxima',
      categoriaIds: [necesidad.id],
    },
    {
      titulo: 'Beca de Excelencia Académica - Universidad Nacional',
      descripcion:
        'Exención del 100% del valor de la matrícula para estudiantes que obtengan los mejores promedios académicos del semestre en cada programa.',
      universidadId: unal.id,
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      tipo: 'pregrado',
      modalidad: 'presencial',
      cobertura: 'total',
      porcentajeCobertura: 100,
      requisitos:
        'Ser estudiante activo de la UNAL. Obtener el promedio más alto del semestre en su programa académico.',
      urlOriginal: 'https://unal.edu.co/becas/excelencia-academica',
      fuente: 'manual',
      estado: 'activa',
      categoriaIds: [merito.id],
    },
    {
      titulo: 'Becas Colfuturo - Crédito Beca para Posgrado en el Exterior',
      descripcion:
        'Financiación para programas de maestría y doctorado en universidades del exterior. Hasta el 50% del crédito puede ser condonable según el área de estudio y el regreso a Colombia.',
      ciudad: 'Nacional',
      departamento: 'Todos',
      tipo: 'posgrado',
      cobertura: 'parcial',
      porcentajeCobertura: 50,
      fechaInicio: new Date('2027-01-20'),
      fechaCierre: new Date('2027-04-30'),
      requisitos:
        'Ser colombiano. Tener título de pregrado. Demostrar admisión o estar en proceso de admisión en una universidad del exterior reconocida.',
      urlOriginal: 'https://www.colfuturo.org/programas/credito-beca',
      fuente: 'colfuturo',
      estado: 'proxima',
      categoriaIds: [internacional.id],
    },
    {
      titulo: 'Beca Comunidades Negras - Universidad de Antioquia',
      descripcion:
        'Programa especial de admisión y apoyo financiero para miembros de comunidades afrocolombianas que deseen ingresar a programas de pregrado.',
      universidadId: udea.id,
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      tipo: 'pregrado',
      modalidad: 'presencial',
      cobertura: 'total',
      porcentajeCobertura: 100,
      requisitos:
        'Certificación de pertenencia a comunidad afrocolombiana. Cumplir con requisitos de admisión de la UdeA.',
      urlOriginal: 'https://udea.edu.co/admisiones/comunidades-negras',
      fuente: 'manual',
      estado: 'activa',
      categoriaIds: [etnicas.id, necesidad.id],
    },
    {
      titulo: 'Beca Talento Uninorte',
      descripcion:
        'Descuento del 25% al 100% en la matrícula para estudiantes con puntajes sobresalientes en las pruebas Saber 11 que ingresen a pregrado.',
      universidadId: uninorte.id,
      ciudad: 'Barranquilla',
      departamento: 'Atlántico',
      tipo: 'pregrado',
      modalidad: 'presencial',
      cobertura: 'parcial',
      porcentajeCobertura: 75,
      fechaInicio: new Date('2027-02-01'),
      fechaCierre: new Date('2027-05-31'),
      requisitos:
        'Puntaje global Saber 11 superior a 350. Solicitar admisión a Uninorte. No haber iniciado estudios de pregrado en otra institución.',
      urlOriginal: 'https://uninorte.edu.co/becas/talento',
      fuente: 'manual',
      estado: 'proxima',
      categoriaIds: [merito.id],
    },
    {
      titulo: 'Beca Mujeres en Ingeniería - Javeriana',
      descripcion:
        'Beca que cubre el 50% de la matrícula para mujeres que ingresen a programas de ingeniería, buscando promover la participación femenina en áreas STEM.',
      universidadId: javeriana.id,
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      tipo: 'pregrado',
      modalidad: 'presencial',
      cobertura: 'parcial',
      porcentajeCobertura: 50,
      fechaInicio: new Date('2027-01-15'),
      fechaCierre: new Date('2027-04-15'),
      requisitos:
        'Ser mujer. Ser admitida a un programa de ingeniería de la PUJ. Mantener promedio acumulado superior a 3.8.',
      urlOriginal: 'https://javeriana.edu.co/becas/mujeres-ingenieria',
      fuente: 'manual',
      estado: 'proxima',
      categoriaIds: [mujerStem.id],
    },
    {
      titulo: 'Beca de Investigación Doctoral - EAFIT',
      descripcion:
        'Beca completa para estudiantes admitidos a programas de doctorado que incluye matrícula, estipendio mensual y apoyo para participación en congresos.',
      universidadId: eafit.id,
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      tipo: 'doctorado',
      modalidad: 'presencial',
      cobertura: 'total',
      porcentajeCobertura: 100,
      requisitos:
        'Tener título de maestría. Ser admitido a un programa de doctorado de EAFIT. Presentar propuesta de investigación aprobada.',
      urlOriginal: 'https://eafit.edu.co/becas/doctorado-investigacion',
      fuente: 'manual',
      estado: 'activa',
      categoriaIds: [investigacion.id],
    },
    {
      titulo: 'Beca Deportista de Alto Rendimiento - Universidad del Rosario',
      descripcion:
        'Descuento del 30% al 70% en la matrícula para deportistas de alto rendimiento con reconocimiento de ligas o federaciones deportivas.',
      universidadId: rosario.id,
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      tipo: 'pregrado',
      modalidad: 'presencial',
      cobertura: 'parcial',
      porcentajeCobertura: 70,
      requisitos:
        'Certificación de deportista de alto rendimiento por Coldeportes o federación reconocida. Ser admitido a un programa de pregrado.',
      urlOriginal: 'https://urosario.edu.co/becas/deporte-alto-rendimiento',
      fuente: 'manual',
      estado: 'activa',
      categoriaIds: [deportiva.id],
    },
    {
      titulo: 'Beca Víctimas del Conflicto - Universidad del Valle',
      descripcion:
        'Exención total de matrícula para víctimas del conflicto armado registradas en el Registro Único de Víctimas (RUV) que ingresen a programas de pregrado.',
      universidadId: univalle.id,
      ciudad: 'Cali',
      departamento: 'Valle del Cauca',
      tipo: 'pregrado',
      modalidad: 'presencial',
      cobertura: 'total',
      porcentajeCobertura: 100,
      requisitos:
        'Estar inscrito en el Registro Único de Víctimas (RUV). Cumplir con requisitos de admisión de Univalle.',
      urlOriginal: 'https://univalle.edu.co/admisiones/victimas-conflicto',
      fuente: 'manual',
      estado: 'activa',
      categoriaIds: [victimas.id],
    },
    {
      titulo: 'ICETEX - Beca de Reciprocidad para Países Conveniados',
      descripcion:
        'Becas para colombianos que deseen realizar estudios de pregrado o posgrado en países con los que Colombia tiene convenios bilaterales de cooperación educativa.',
      ciudad: 'Nacional',
      departamento: 'Todos',
      tipo: 'posgrado',
      cobertura: 'total',
      porcentajeCobertura: 100,
      fechaInicio: new Date('2027-03-01'),
      fechaCierre: new Date('2027-06-30'),
      requisitos:
        'Ser colombiano. Tener título universitario. Dominio del idioma del país destino. No haber sido beneficiario de otra beca ICETEX internacional.',
      urlOriginal: 'https://portal.icetex.gov.co/becas/reciprocidad',
      fuente: 'icetex',
      estado: 'proxima',
      categoriaIds: [internacional.id, merito.id],
    },
  ];

  for (const becaData of becas) {
    const { categoriaIds, ...data } = becaData;
    const beca = await prisma.beca.create({ data });

    if (categoriaIds.length > 0) {
      await prisma.becaCategoria.createMany({
        data: categoriaIds.map((categoriaId: string) => ({
          becaId: beca.id,
          categoriaId,
        })),
      });
    }
  }

  console.log(`✅ ${becas.length} becas creadas`);
  console.log('🎉 Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
