// src/api/pucApi.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class PucApiService {
  // Obtener todas las cuentas con filtros
  static async getCuentas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE}/api/puc?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
      throw error;
    }
  }

  // Obtener árbol completo de cuentas
  static async getArbolCuentas() {
    try {
      const response = await fetch(`${API_BASE}/api/puc/arbol`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener árbol de cuentas:', error);
      throw error;
    }
  }

  // Obtener cuenta por ID
  static async getCuentaById(id) {
    try {
      const response = await fetch(`${API_BASE}/api/puc/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener cuenta:', error);
      throw error;
    }
  }

  // Obtener cuenta por código
  static async getCuentaByCodigo(codigo) {
    try {
      const response = await fetch(`${API_BASE}/api/puc/codigo/${codigo}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener cuenta por código:', error);
      throw error;
    }
  }

  // Crear nueva cuenta
  static async createCuenta(cuentaData) {
    try {
      const response = await fetch(`${API_BASE}/api/puc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuentaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      throw error;
    }
  }

  // Actualizar cuenta
  static async updateCuenta(id, cuentaData) {
    try {
      const response = await fetch(`${API_BASE}/api/puc/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuentaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar cuenta:', error);
      throw error;
    }
  }

  // Eliminar cuenta
  static async deleteCuenta(id) {
    try {
      const response = await fetch(`${API_BASE}/api/puc/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      throw error;
    }
  }

  // Importar PUC estándar de Colombia
  static async importPucEstandarColombia() {
    try {
      const response = await fetch(`${API_BASE}/api/puc/importar/estandar-colombia`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al importar PUC estándar:', error);
      throw error;
    }
  }

  // Obtener PUC estándar (sin importar)
  static async getPucEstandarColombia() {
    try {
      const response = await fetch(`${API_BASE}/api/puc/estandar-colombia`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener PUC estándar:', error);
      throw error;
    }
  }

  // Importar PUC personalizado
  static async importPucPersonalizado(cuentas, opciones = {}) {
    try {
      const importData = {
        cuentas,
        sobrescribir_existentes: opciones.sobrescribir || false,
        validar_jerarquia: opciones.validarJerarquia || true,
      };

      const response = await fetch(`${API_BASE}/api/puc/importar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al importar PUC personalizado:', error);
      throw error;
    }
  }

  // Validar código PUC
  static validateCodigoPuc(codigo, codigoPadre = null) {
    const longitud = codigo.length;
    
    // Validar que solo contenga números
    if (!/^\d+$/.test(codigo)) {
      return {
        valid: false,
        error: 'El código debe contener solo números'
      };
    }

    // Si no hay código padre, debe ser una clase (1 dígito)
    if (!codigoPadre && longitud !== 1) {
      return {
        valid: false,
        error: 'Las cuentas sin padre deben ser clases (1 dígito)'
      };
    }

    // Si hay código padre, validar jerarquía
    if (codigoPadre) {
      if (!codigo.startsWith(codigoPadre)) {
        return {
          valid: false,
          error: 'El código debe comenzar con el código padre'
        };
      }

      const longitudPadre = codigoPadre.length;
      let longitudEsperada;

      switch (longitudPadre) {
        case 1: // Padre es clase, hijo debe ser grupo (2 dígitos)
          longitudEsperada = 2;
          break;
        case 2: // Padre es grupo, hijo debe ser cuenta (4 dígitos)
          longitudEsperada = 4;
          break;
        case 4: // Padre es cuenta, hijo debe ser subcuenta (6 dígitos)
          longitudEsperada = 6;
          break;
        case 6: // Padre es subcuenta, hijo debe ser auxiliar (7+ dígitos)
          if (longitud < 7) {
            return {
              valid: false,
              error: 'Las auxiliares deben tener al menos 7 dígitos'
            };
          }
          break;
        default:
          if (longitud <= longitudPadre) {
            return {
              valid: false,
              error: 'El código hijo debe ser más largo que el padre'
            };
          }
      }

      if (longitudEsperada && longitud !== longitudEsperada) {
        return {
          valid: false,
          error: `Para un padre de ${longitudPadre} dígitos, el hijo debe tener ${longitudEsperada} dígitos`
        };
      }
    }

    return { valid: true };
  }

  // Determinar tipo de cuenta por longitud de código
  static getTipoCuentaByCodigo(codigo) {
    const longitud = codigo.length;
    
    if (longitud === 1) return 'CLASE';
    if (longitud === 2) return 'GRUPO';
    if (longitud === 4) return 'CUENTA';
    if (longitud === 6) return 'SUBCUENTA';
    return 'AUXILIAR';
  }

  // Determinar naturaleza por clase
  static getNaturalezaByClase(codigo) {
    const clase = codigo.charAt(0);
    
    switch (clase) {
      case '1': // Activos
      case '5': // Gastos
      case '6': // Costos
      case '7': // Costos de producción
        return 'DEBITO';
      case '2': // Pasivos
      case '3': // Patrimonio
      case '4': // Ingresos
      case '8': // Cuentas de orden deudoras
      case '9': // Cuentas de orden acreedoras
        return 'CREDITO';
      default:
        return 'DEBITO';
    }
  }

  // Obtener estadísticas del PUC
  static async getEstadisticasPuc() {
    try {
      const cuentasResponse = await this.getCuentas();
      const cuentas = cuentasResponse.data || [];

      const estadisticas = {
        total: cuentas.length,
        por_tipo: {},
        por_naturaleza: {},
        por_estado: {},
        activas_con_movimientos: 0,
        clases_disponibles: new Set(),
      };

      cuentas.forEach(cuenta => {
        // Por tipo
        estadisticas.por_tipo[cuenta.tipo_cuenta] = 
          (estadisticas.por_tipo[cuenta.tipo_cuenta] || 0) + 1;

        // Por naturaleza
        estadisticas.por_naturaleza[cuenta.naturaleza] = 
          (estadisticas.por_naturaleza[cuenta.naturaleza] || 0) + 1;

        // Por estado
        estadisticas.por_estado[cuenta.estado] = 
          (estadisticas.por_estado[cuenta.estado] || 0) + 1;

        // Activas con movimientos
        if (cuenta.estado === 'ACTIVA' && cuenta.acepta_movimientos) {
          estadisticas.activas_con_movimientos++;
        }

        // Clases disponibles
        if (cuenta.tipo_cuenta === 'CLASE') {
          estadisticas.clases_disponibles.add(cuenta.codigo);
        }
      });

      estadisticas.clases_disponibles = Array.from(estadisticas.clases_disponibles);

      return estadisticas;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Exportar PUC a formato CSV
  static exportToCsv(cuentas) {
    const headers = [
      'Código',
      'Nombre',
      'Descripción',
      'Tipo',
      'Naturaleza',
      'Estado',
      'Código Padre',
      'Acepta Movimientos',
      'Requiere Tercero',
      'Requiere Centro Costo',
      'Es Cuenta NIIF',
      'Código NIIF',
      'Dinámica'
    ];

    const csvContent = [
      headers.join(','),
      ...cuentas.map(cuenta => [
        cuenta.codigo,
        `"${cuenta.nombre}"`,
        `"${cuenta.descripcion || ''}"`,
        cuenta.tipo_cuenta,
        cuenta.naturaleza,
        cuenta.estado,
        cuenta.codigo_padre || '',
        cuenta.acepta_movimientos ? 'SI' : 'NO',
        cuenta.requiere_tercero ? 'SI' : 'NO',
        cuenta.requiere_centro_costo ? 'SI' : 'NO',
        cuenta.es_cuenta_niif ? 'SI' : 'NO',
        cuenta.codigo_niif || '',
        `"${cuenta.dinamica || ''}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  // Descargar PUC como archivo CSV
  static downloadCsvFile(cuentas, filename = 'plan_unico_cuentas.csv') {
    const csvContent = this.exportToCsv(cuentas);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Buscar cuentas por término
  static async buscarCuentas(termino, filtros = {}) {
    const filtrosConBusqueda = {
      ...filtros,
      busqueda: termino
    };

    return await this.getCuentas(filtrosConBusqueda);
  }

  // Obtener subcuentas de una cuenta específica
  static async getSubcuentas(codigoPadre) {
    const filtros = {
      codigo_padre: codigoPadre,
      incluir_subcuentas: true
    };

    return await this.getCuentas(filtros);
  }
}

export default PucApiService;