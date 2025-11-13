	
	// Métricas numéricas genéricas para todos los valores numericos
	export type NumericMetric = {
			value: number;
			timestamp: string; // ISO 8601
	   };

	// Metricas booleanas genéricas para todos los valores booleanos
	export type BooleanMetric = {
			value: boolean;
			timestamp: string; // ISO 8601
	   };

   //  * Utility type para extraer las claves de un objeto que tienen estructura de métrica

   export type ExtractMetricKeys<T> = {
		[K in keyof T]: T[K] extends NumericMetric | BooleanMetric ? K : never
   }[keyof T];

	// =============================================================================
	// OBJETOS DE MUESTRA PARA INFERENCIA AUTOMÁTICA
	// =============================================================================

	/**
	 * Objeto de muestra para GeneratorMetrics
	 */

    const generatorSample = {
		potencia_activa: { value: 0, timestamp: ''},
		potencia_aparente: { value: 0, timestamp: ''},
		potencia_reactiva: { value: 0, timestamp: ''},
		factor_potencia: { value: 0, timestamp: ''},
		frecuencia: { value: 0, timestamp: ''},
		corriente_L1: { value: 0, timestamp: ''},
		corriente_L2: { value: 0, timestamp: ''},
		corriente_L3: { value: 0, timestamp: ''},
		voltage_L1_L2: { value: 0, timestamp: ''},
		voltage_L2_L3: { value: 0, timestamp: ''},
		voltage_L1_L3: { value: 0, timestamp: ''},
		voltage_L1_N: { value: 0, timestamp: ''},
		voltage_L2_N: { value: 0, timestamp: ''},
		voltage_L3_N: { value: 0, timestamp: ''},
		energia_fase_A: { value: 0, timestamp: ''},
		energia_fase_B: { value: 0, timestamp: ''},
		energia_fase_C: { value: 0, timestamp: ''},
		secuencia_positiva: { value: 0, timestamp: '' },
		secuencia_negativa: { value: 0, timestamp: '' },
		secuencia_zero: { value: 0, timestamp: '' },
		desbalance_corriente: { value: 0, timestamp: '' },
		promedio_corrientes: { value: 0, timestamp: '' },
		promedio_voltajes: { value: 0, timestamp: '' },
		delta_L1_barra: { value: 0, timestamp: '' },
		delta_L2_barra: { value: 0, timestamp: '' },
		delta_L3_barra: { value: 0, timestamp: '' },
	};

	// =============================================================================
	/**
 	* Objeto de muestra para BusbarMetrics
 	*/
	const busbarSample = {
		voltage_L1_L2: { value: 0, timestamp: '' },
		voltage_L2_L3: { value: 0, timestamp: '' },
		voltage_L1_L3: { value: 0, timestamp: '' },
		frecuencia: { value: 0, timestamp: '' },
		angulo_fase_A: { value: 0, timestamp: '' },
		angulo_fase_B: { value: 0, timestamp: '' },
		angulo_fase_C: { value: 0, timestamp: '' },
		secuencia_positiva: { value: 0, timestamp: '' },
		secuencia_negativa: { value: 0, timestamp: '' },
		secuencia_zero: { value: 0, timestamp: '' },
	};

		/**
	 * Objeto de muestra para BreakerStatus (valores booleanos)
	 */
	const breakerSample = {
	  	voltage_freq_ok: { value: true, timestamp: '' },
	  	opened: { value: false, timestamp: '' },
	  	closed: { value: true, timestamp: '' },
	  	fault: { value: false, timestamp: '' },
	  	ready_to_close: { value: false, timestamp: '' },
	  	sync_in_progress: { value: false, timestamp: '' },
	  	ready_to_open: { value: false, timestamp: '' },
	};

	/**
	 * Objeto de muestra para TemperatureMetrics
	 */
	const temperatureSample = {
	 	devanado_u: { value: 0, timestamp: '' },
	 	devanado_v: { value: 0, timestamp: '' },
	 	devanado_w: { value: 0, timestamp: '' },
	 	rodamiento_delantero: { value: 0, timestamp: '' },
	 	rodamiento_trasero: { value: 0, timestamp: '' },
	};

	// =============================================================================
	// INTERFACES PRINCIPALES CON INFERENCIA AUTOMÁTICA
	// =============================================================================

		/**
	 * Métricas del generador
	 */
	export type GeneratorMetrics = {
	  [K in ExtractMetricKeys<typeof generatorSample>]: NumericMetric;
	};

	/**
	 * Métricas del busbar
	 */
	export type BusbarMetrics = {
	  [K in ExtractMetricKeys<typeof busbarSample>]: NumericMetric;
	};

	/**
	 * Estado del breaker
	 */
	export type BreakerStatus = {
	  [K in ExtractMetricKeys<typeof breakerSample>]: BooleanMetric;
	};

	/**
	 * Métricas de temperatura
	 */
	export type TemperatureMetrics = {
	  [K in ExtractMetricKeys<typeof temperatureSample>]: NumericMetric;
	};

	/**
	 * Bloque principal de datos que contiene todas las métricas
	 */
	export interface IotData {
	  generator: GeneratorMetrics;
	  busbar: BusbarMetrics;
	  breaker: BreakerStatus;
	  temperature: TemperatureMetrics;
	}

	/**
	 * Metadatos del reporte
	 */
	export interface IotMetadata {
	  variables_count: number;
	  last_update: string;
	}

	/**
	 * Contrato principal para el reporte IoT completo
	 */
	export interface IotReportData {
	  timestamp: string;
	  device_id: string;
	  device_type: string;
	  data: IotData;
	  metadata: IotMetadata;
	}

	// =============================================================================
	// ENUMS PARA VALORES PREDEFINIDOS
	// =============================================================================

	export enum DeviceType {
	  GPC_300 = "GPC-300",
	  GPC_400 = "GPC-400",
	  UNKNOWN = "unknown"
	}

	export enum MetricStatus {
	  NORMAL = "normal",
	  WARNING = "warning",
	  CRITICAL = "critical",
	  OFFLINE = "offline"
	}

		
				
		

