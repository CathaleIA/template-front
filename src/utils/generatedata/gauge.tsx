// GAUGES
interface VoltageGaugeProps {
    type?: string;
    variable?: number;
    minVariable?: number;
    maxVariable?: number;
    title?: string;
    unit?: string;
    warningLow?: number;
    warningHight?: number;
    reference?: number;
    optimalMin?: number;
    optimalMax?: number;
}


const PressionGasData: VoltageGaugeProps = {
    variable: 25,
    minVariable: 0,
    maxVariable: 40,
    title: 'Presion de entrada',
    unit: 'psi',
    optimalMax: 30,
    optimalMin: 20,
    warningHight: 35,
    warningLow: 5,
    reference: 25,
}

const PressionTurboData: VoltageGaugeProps = {
    variable: 40,
    minVariable: 0,
    maxVariable: 60,
    title: 'Presion de entrada',
    unit: 'psi',
    optimalMax: 50,
    optimalMin: 40,
    warningHight: 52,
    warningLow: 25,
    reference: 45,
}

const PressionAceiteData: VoltageGaugeProps = {
    variable: 54,
    minVariable: 0,
    maxVariable: 60,
    title: 'Presion de entrada',
    unit: 'psi',
    optimalMax: 50,
    optimalMin: 40,
    warningHight: 55,
    warningLow: 25,
    reference: 45,
}


const VelocidadData: VoltageGaugeProps = {
    variable: 1600,
    minVariable: 0,
    maxVariable: 2000,
    title: 'Velocidad del rotor',
    unit: 'rpm',
    optimalMax: 1850,
    optimalMin: 1750,
    warningHight: 1900,
    warningLow: 1700,
    reference: 1800,
}

const PowerFactorData: VoltageGaugeProps = {
    variable: 0.96,
    minVariable: 0,
    maxVariable: 1.5,
    title: 'Factor de potencia',
    unit: '',
    optimalMax: 1,
    optimalMin: 0.90,
    warningHight: 1.2,
    warningLow: 0.85,
    reference: 1,
}

//OUTPUTS
export {
    PressionGasData,
    VelocidadData,
    PressionAceiteData,
    PressionTurboData,
    PowerFactorData,
}