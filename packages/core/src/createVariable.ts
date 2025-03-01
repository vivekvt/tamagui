import { isWeb } from '@tamagui/constants'
import { simpleHash } from '@tamagui/helpers'

import { getConfig } from './config'

/**
 * Should rename this to Token
 * Moving to objects for React Server Components support
 */

const IS_VAR = 'isVar'

type VariableIn<A = any> = {
  val: A
  name: string
  key: string
}

export type Variable<A = any> = VariableIn<A> & {
  [IS_VAR]?: true
  variable?: string
}

export const createVariable = <A extends string | number = any>(props: VariableIn<A>) => {
  if (isVariable(props)) return props
  const { key, name, val } = props
  return {
    [IS_VAR]: true,
    key,
    name: simpleHash(name, 40),
    val,
    variable: isWeb ? createCSSVariable(name) : '',
  }
}

export function variableToString(vrble?: any, getValue = false) {
  if (isVariable(vrble)) {
    if (!getValue && isWeb && vrble.variable) {
      return vrble.variable
    }
    setDidGetVariableValue(true)
    return `${vrble.val}`
  }
  return `${vrble || ''}`
}

export function isVariable(v: Variable | any): v is Variable {
  return v && typeof v === 'object' && IS_VAR in v
}

export function getVariable(nameOrVariable: Variable | string) {
  if (isVariable(nameOrVariable)) {
    return variableToString(nameOrVariable)
  }
  const tokens = getConfig().tokensParsed
  return variableToString(tokens[nameOrVariable] ?? nameOrVariable)
}

let accessed = false
export const setDidGetVariableValue = (val: boolean) => (accessed = val)
export const didGetVariableValue = () => accessed

export function getVariableValue(v: Variable | any) {
  if (isVariable(v)) {
    setDidGetVariableValue(true)
    return v.val
  }
  return v
}

export function getVariableName(v: Variable | any) {
  if (isVariable(v)) return v.name
  return v
}

export function getVariableVariable(v: Variable | any) {
  if (isVariable(v)) return v.variable
  return v
}

// bugfix { space: { 0.5: 10 } } was generating var(--space-0.5) (invalid CSS):
export const createCSSVariable = (nameProp: string, includeVar = true) => {
  if (process.env.NODE_ENV === 'development') {
    if (!nameProp || typeof nameProp !== 'string') {
      throw new Error(`createCSSVariable expected string: ${nameProp}`)
    }
  }
  const name = simpleHash(nameProp, 60)
  return includeVar ? `var(--${name})` : name
}
