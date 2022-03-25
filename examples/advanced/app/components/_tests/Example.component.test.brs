' @import /components/KopytkoFrameworkTestSuite.brs from @dazn/kopytko-unit-testing-framework

function TestSuite__ExampleComponent() as Object
  ts = KopytkoFrameworkTestSuite()
  ts.name = "ExampleComponent"

  ts.addTest("should render component", function (ts as Object) as String
    ' When
    initKopytko()

    ' Then
    return ts.assertNotInvalid(m.label)
  end function)

  return ts
end function
