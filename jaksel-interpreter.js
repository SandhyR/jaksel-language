const fs = require('fs');

const inputFile = () => {
  let args = process.argv
  if(args.length < 3){
    throw "Require file args, ex: 'node jaksel-interpreter.js jaksel'"
  }
  return args[2]
}

const inputJaksel = fs.readFileSync(inputFile(), 'utf-8')

function flexing(input){
  let cmds = []
  const cmdLines = input.split('\n').filter(v => !!v)
  cmds = getCmd(cmdLines)
  return cmds;
}

function getCmd(cmdLines){
  let parser = [
    varAssign,
    consoleLog,
    conditionIf,
    conditionElse,
    conditionClose,
  ]

  return cmdLines.map((line) => {
    let cmd = null
    
    for (const parse of parser) {
      cmd = parse(line)
      if(cmd) break;

    }

    return cmd
  }).filter((v) => !!v)
}

let mapCompare = {
  'itu': ' == ',
  'lebih gede': '>',
  'lebih kecil': ' < ',
  'lebih gede sama dengan': ' >= ',
  'lebih kecil sama dengan': ' <= '
}

const isChild = (msg) => {
  let match = msg.match(/^(  )+(?=[a-zA-Z])/)
  if(!match) return null
  let matchSpace = match[0]
  let totalSpace = matchSpace.split('').length
  if(!totalSpace) return null
  const minimalSpace = 2

  return totalSpace / minimalSpace
}

const varAssign = (msg) => {
  let format = /literally ([a-zA-Z0-9]+) itu ([^\[\]\(\)\n]+)/
  let match = msg.match(format)
  if(!match) return null;

  return {
    exp: `let ${match[1]} = ${match[2]};`
  }
}

const consoleLog = (msg) => {
  let format = /spill (.*)/
  let match = msg.match(format)
  if(!match) return null;

  return {
    exp: `console.log(${match[1]});`
  }
}

const conditionIf = (msg) => {
  let format = /kalo ([a-zA-Z0-9]+) ([a-zA-Z ]+) ([^\[\]\(\)\n]+)/
  let match = msg.match(format)
  if(!match) return null;
  if(match[2]){
    match[2] = mapCompare[match[2]]
  }

  return {
    exp: `if (${match[1]} ${match[2]} ${match[3]})`,
    openGroup: true
  }
}

const conditionElse = (msg) => {
  let format = /kalogak$/
  let match = msg.match(format)
  if(!match) return null;

  return {
    exp: `else`,
    closeGroup: true,
    openGroup: true
  }
}

const conditionClose = (msg) => {
  let format = /udahan$/
  let match = msg.match(format)
  if(!match) return null;

  return {
    exp: ``,
    closeGroup: true,
  }
}

const execCmd = (cmds) => {
  let resultCmds = '';

  let isOpenGroup = false
  for (const cmd of cmds) {
    let tempRes = cmd.exp
    if(cmd.closeGroup){
      tempRes = '} ' + tempRes
      isOpenGroup = false
    }
    if(cmd.openGroup){
      tempRes = tempRes + ' {'
      isOpenGroup = true
    }
    resultCmds += tempRes + '\n'
  }
  if(isOpenGroup){
    resultCmds += ' }'
  }
  eval(resultCmds)
}

const result = flexing(inputJaksel)
execCmd(result)
