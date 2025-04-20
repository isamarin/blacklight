# @greenlight/logger

This package is the log handler. The logger contains a singleton structure which holds all the log data in sinks.
The sinks can then later be used to scan through and use to debug better.

## Class: Logger

### constructor(name:string):void

Creates a new logger with a sink name of the given input.

### log(...args:any[]):void

Logs the given input to the logger's sink. In addition the log will also be shown on stdout.

### warning(...args:any[]):void

Logs the given input to the logger's sink with [WARNING] prepended. In addition the log will also be shown on stdout.

### extend(name:string):Logger

Extends the given sink with a new sub sink. This can be used if you want to log certain session apart from each other.

### display():void

Writes the current sink log data to the stdout with formatting.