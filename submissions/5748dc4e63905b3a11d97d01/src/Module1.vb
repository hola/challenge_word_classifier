Imports System
Module Module1
    Dim startTime As String = ""
    Sub Main()
        startTime = "started at " & Now.ToString
        Console.WriteLine(startTime)
        Dim patch As String = ""
        For i = 0 To My.Application.CommandLineArgs.Count - 1
            patch &= My.Application.CommandLineArgs(i)
        Next
        core(patch, "result.txt")
        'writeToFile("\test5num\compress\CompressAll3.txt", bufff)
        Console.WriteLine(startTime)
        Console.WriteLine("----------------------------------")
        Console.WriteLine("stoped at " & Now.ToString)
        Console.WriteLine("Done!")
        Console.ReadKey()
    End Sub

    Sub core(ByVal fileInput As String, ByVal fileOutput As String)
        Dim alf As String = "lmnopqrstuvwxyzabcdefghijk_"
        Dim str As String = ""
        str = My.Computer.FileSystem.ReadAllText(fileInput) '"\textX.txt") ' "\test4\X.txt") ' 
        'Dim wordbook As String = ""

        Dim idx As Integer = 0
        Dim id As Integer = 0
        idx = str.IndexOf("*")
        Dim sym(1) As String
        Dim connect(1) As String
        Dim buff2 As String = ""
        Dim buff As String = ""
        Do While idx <> -1

            Dim subStr As String = str.Substring(0, idx).ToLower
            Console.WriteLine(startTime)
            Console.WriteLine(fileInput)
            Console.WriteLine("==================================")
            Console.WriteLine("[" & id & "] " & subStr)
            Dim wordLen As Integer = subStr.Length
            Dim word As String = subStr
           
            If wordLen >= 3 Then
                wordLen = wordLen \ 3
                Dim conStr As String = ""
                If sym.Length < wordLen Then
                    ReDim sym(wordLen - 1)
                End If
                For i = 0 To wordLen - 1
                    Dim Ach As String = word.Substring(i * 3, 3)
                    If sym(i) = Nothing Then sym(i) = "sym " & i & " ,"
                    If sym(i).IndexOf(Ach & ",") = -1 Then sym(i) &= Ach & ","

                    'If wordLen - 1 <> 0 Then
                    '    'If i = 0 Then
                    '    '    conStr &= Ach(2)
                    '    'End If
                    '    'conStr &= Ach(0) & Ach(2)
                    '    'If i = wordLen - 1 Then
                    '    '    conStr &= Ach(0)
                    '    'End If
                    '    Select Case i
                    '        Case 0
                    '            conStr &= Ach(2)
                    '        Case wordLen - 1
                    '            conStr &= Ach(0)
                    '        Case Else
                    '            conStr &= Ach(0) & Ach(2)
                    '    End Select
                    'End If
                Next i
                If subStr.Length \ 3 >= 2 Then
                    For i = 1 To subStr.Length \ 3 - 1
                        If connect.Length < subStr.Length \ 3 Then
                            ReDim connect(subStr.Length \ 3)
                        End If
                        If connect(i - 1) = Nothing Then connect(i - 1) = "con " & i - 1 & " ,"
                        If connect(i - 1).IndexOf(word.Substring(i * 3 - 1, 2) & ",") = -1 Then connect(i - 1) &= word.Substring(i * 3 - 1, 2) & ","
                    Next
                End If
                
                'For i = 0 To conStr.Length \ 2 - 1
                '    'If sym.Length < i Then
                '    '    ReDim connect(i)
                '    'End If
                '    If connect(i) = Nothing Then connect(i) = "con " & i & " ,"
                '    If connect(i).IndexOf(conStr.Substring(i * 2, 2) & ",") = -1 Then connect(i) &= conStr.Substring(i * 2, 2) & ","
                'Next
                'Console.WriteLine(" conStr = " & conStr)
            End If

            'Console.WriteLine("       N = " & N)
            'Console.WriteLine("       K = " & K)
            Console.WriteLine(" WordLen = " & wordLen)
            'Console.WriteLine("    div2 = " & div2)

            str = str.Remove(0, idx + 1)
            idx = str.IndexOf("*")
            id += 1
            'If id Mod 5000 = 0 Then
            '    Console.WriteLine("buffering")
            '    For i = 0 To sym.Length - 1
            '        buff &= sym(i) & vbCrLf
            '    Next
            '    For i = 0 To connect.Length - 1
            '        buff2 &= connect(i) & vbCrLf
            '    Next
            '    Console.WriteLine("==================================")
            '    'Console.WriteLine("remove doubles")
            '    'For i = 0 To alf.Length - 1
            '    '    Dim Ach As String = alf(i)
            '    '    buff = buff.Replace(Ach & Ach, Ach)
            '    '    buff = buff.Replace(Ach & Ach, Ach)
            '    'Next
            '    Console.WriteLine("==================================")
            '    Console.WriteLine("printing")
            '    writeToFile(fileOutput & ".tmp" & id & ".txt", buff & vbCrLf & buff2)
            '    buff = ""
            '    buff2 = ""
            'End If

            Console.Clear()
        Loop


        'For i = 0 To 60
        '    For j = 0 To 27
        '        buff &= "[" & sym(i, j) & "]"
        '    Next
        '    buff &= vbCrLf
        'Next i
        'For j = 0 To sym.Length - 1
        '    For i = 0 To alf.Length - 1
        '        Dim Ach As String = alf(i)
        '        sym(j) = sym(j).Replace(Ach & Ach, Ach)
        '        sym(j) = sym(j).Replace(Ach & Ach, Ach)
        '    Next
        'Next
        Console.WriteLine("==================================")
        Console.WriteLine("buffering")
        For i = 0 To sym.Length - 1
            buff &= sym(i) & vbCrLf
        Next
        For i = 0 To connect.Length - 1
            buff2 &= connect(i) & vbCrLf
        Next
        Console.WriteLine("==================================")
        'Console.WriteLine("remove doubles")
        'For i = 0 To alf.Length - 1
        '    Dim Ach As String = alf(i)
        '    buff = buff.Replace(Ach & Ach, Ach)
        '    buff = buff.Replace(Ach & Ach, Ach)
        'Next
        Console.WriteLine("==================================")
        Console.WriteLine("printing")
        writeToFile(fileOutput & ".tmp" & id & ".txt", buff & vbCrLf & buff2)

    End Sub

    Sub core2hash(ByVal fileInput As String, ByVal fileOutput As String)

        Dim str As String = ""
        str = My.Computer.FileSystem.ReadAllText(fileInput) '"\textX.txt") ' "\test4\X.txt") ' 
        'Dim wordbook As String = ""

        Dim idx As Integer = 0
        Dim id As Integer = 0
        idx = str.IndexOf("*")
        Dim sym(30) As String
        Dim err As String = ""
        Dim buff As String = ","
        Do While idx <> -1

            Dim subStr As String = str.Substring(0, idx).ToLower
            Console.Clear()
            Console.WriteLine(fileInput)
            Console.WriteLine("==================================")
            Console.WriteLine("[" & id & "] " & subStr)

            If sym.Length - 1 < id Then ReDim sym(id)

            'Dim counter As Integer = 2

            Dim wordLen As Integer = subStr.Length

            Dim word As String = subStr

            'Dim N As Integer = 0

            'Dim Nn As Integer = wordLen \ 2

            
            'If sym(N) = Nothing Then sym(N) = ""

            Dim hash As String = strAsciiHash(word)

            'If sym(id) = Nothing Then sym(id) = ""
            If buff.IndexOf("," & hash.ToString & ",") = -1 Then buff &= hash.ToString & ","
            'sym(id) = hash.ToString


            'Console.WriteLine("       N = " & N)
            'Console.WriteLine("       K = " & K)
            Console.WriteLine(" WordLen = " & wordLen)
            Console.WriteLine("    hash = " & hash)

            str = str.Remove(0, idx + 1)
            idx = str.IndexOf("*")
            id += 1

        Loop

        'Dim buff As String = ""
        'For i = 0 To sym.Length - 1
        '    buff &= sym(i) & vbCrLf
        'Next i
        writeToFile(fileOutput, buff)

    End Sub

    Function strAsciiHash(ByVal str As String) As String
        Dim hash As Long = 0
        'For i = 0 To str.Length - 1

        '    hash += Asc(str(i)) + (i + 1)

        'Next i
        'hash += hash \ str.Length
        Select Case str.Length
            Case 1, 2, 3, 45, 58, 60, 25 To 34
                Return str
            Case 4 To 7
                Return str.Substring(0, 2) & str.Length
            Case 8, 9
                Return str.Substring(0, 2) & str.Length
            Case 10 To 16
                Return str.Substring(0, 2) & str.Length
            Case 17 To 24
                Return str.Substring(0, 2) & str.Length


        End Select
        Return hash
    End Function

    Sub writeToFile(ByVal file As String, ByVal text As String)
        file = My.Application.Info.DirectoryPath & "\" & file
        My.Computer.FileSystem.WriteAllText(file, text, True)
    End Sub
    'For i = 0 To subStr.Length - 1
    '    'writeToFile("test4\[" & i + 1 & "]" & subStr(i), subStr & vbCrLf)
    '    'strLine (i) = 
    '    'strLine(i) &= strLine(i).Replace(subStr(i), "") & subStr(i) & "."
    '    strLine(i) &= subStr(i) & "."
    'Next

    'writeToFile(subStr.Length & ".txt", subStr & vbCrLf)
    'If sym.Length < subStr.Length Then ReDim sym(subStr.Length - 1)
    'For i = 0 To subStr.Length - 1
    '    If sym(i) = Nothing Then sym(i) = ""
    '    If sym(i).IndexOf(subStr(i)) = -1 Then sym(i) &= subStr(i)
    '    'sym(i) &= subStr(i)

    'Next i

    'Dim wordLen As Integer = subStr.Length
    'Dim counter As Integer = 2
    'Dim K As Integer = 0
    'While wordLen > 0

    '    If sym(K) = Nothing Then sym(K) = ""
    '    Dim tmpstr As String = subStr.Substring(0, counter)
    '    If sym(K).IndexOf(tmpstr & "|") = -1 Then sym(K) &= tmpstr & "|" ' строка с a, bc, deg, j.
    '    subStr = subStr.Remove(0, counter)
    '    'counter += 1
    '    K += 1
    '    wordLen -= counter


    'End While
    'If wordLen < 0 Then
    '    If sym(K) = Nothing Then sym(K) = ""
    '    If sym(K).IndexOf(subStr & "|") = -1 Then sym(K) &= subStr & "|" ' строка с a, bc, deg, j.
    'End If

End Module
