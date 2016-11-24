function timer(callback, delay) {
  var id, started, remaining = delay*1000, running

  this.start = function() {
    running = true
    started = new Date().getTime()
    id = setTimeout(callback, remaining)
  }

  this.pause = function() {
    running = false
    clearTimeout(id)
    remaining -= new Date().getTime() - started
  }

  this.getTimeLeft = function() {
    if (running) {
      this.pause()
      this.start()
    }

    return this.toSec(remaining)
  }

  this.getStateRunning = function() {
    return running
  }

  this.destroy = function(){
    clearTimeout(id)
  }

  this.toSec = function(ms){
    return parseInt(Math.ceil(ms)/1000);
  }
  this.start()
}

module.exports = timer;