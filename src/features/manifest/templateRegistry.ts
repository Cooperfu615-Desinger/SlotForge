import tplClassic3x3 from '../../assets/templates/tpl_classic_3x3.json'
import tplStandard3x5 from '../../assets/templates/tpl_standard_3x5.json'
import tplWay3x5 from '../../assets/templates/tpl_way_3x5.json'
import tplExtended4x5 from '../../assets/templates/tpl_extended_4x5.json'
import tplPayAnywhere6x5 from '../../assets/templates/tpl_pay_anywhere_6x5.json'
import tplCluster7x7 from '../../assets/templates/tpl_cluster_7x7.json'
import tplMegaways6 from '../../assets/templates/tpl_megaways_6.json'
import type { TemplateConfig } from './types'

export const DEFAULT_TEMPLATE_ID = 'standard_3x5'

export const TEMPLATES: Record<string, TemplateConfig> = {
  classic_3x3: tplClassic3x3,
  standard_3x5: tplStandard3x5,
  way_3x5: tplWay3x5,
  extended_4x5: tplExtended4x5,
  pay_anywhere_6x5: tplPayAnywhere6x5,
  cluster_7x7: tplCluster7x7,
  megaways_6: tplMegaways6,
}

export const DEFAULT_CONFIG = TEMPLATES[DEFAULT_TEMPLATE_ID]
