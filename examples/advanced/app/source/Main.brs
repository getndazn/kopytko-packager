sub main(launchArguments as Dynamic)
  screen = CreateObject("roSGScreen")
  port = CreateObject("roMessagePort")

  screen.setMessagePort(port)
  screen.show()

  scene = screen.createScene("MainScene")
  scene.setFocus(true)

  while (true)
    message = Wait(0, port)
    messageType = Type(message)
  end while
end sub
