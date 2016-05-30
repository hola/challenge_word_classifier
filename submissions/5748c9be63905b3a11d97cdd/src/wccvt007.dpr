{$APPTYPE CONSOLE}

uses
  SysUtils;

const
  FileDictionary = 'words.lower.txt';
  FileFalseTests = 'tests.false.txt';

const
  MaxWordInList = 700000;

var
  MaxBucket: Integer;
  MaxWordLen: Integer;
  MaxNodeCount: LongInt; { = MaxBucket ^ MaxWordLen }
  MinWeight: Integer;
  FileOut: String;
  FileOutDict: String;

const
  DropWordLen = 150; //input string dropped if length > DropWordLen

const
  CntAllowedChars = 28;
  AllowedChars: array[1..CntAllowedChars] of Char = #39'abcdefghijklmnopqrstuvwxyz$'; //last symbol - end of word

const
  PredefinedBuckets: array[1..CntAllowedChars] of Integer = (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);

type
  TWordList = array[1..MaxWordInList] of ShortString;

  PRec = ^TRec;
  TRec = record
    N: array[1..14] of PRec;
    Weight: LongInt;
  end;

  TDict = record
    Root: PRec;
    NodeCount: Integer;
  end;

var
  ListDictionary: TWordList;
  ListDictionarySize: LongInt;
  ListFalseTests: TWordList;
  ListFalseTestsSize: LongInt;

var
  Convert: array[Char] of Integer;
  ModifyConvertCounter: Integer;
  UndoType: Integer;
  UndoCharInd1: Integer;
  UndoBucketInd1: Integer;
  UndoCharInd2: Integer;
  UndoBucketInd2: Integer;

procedure PrepareConvert;
var
  I: Integer;
begin
  for I := 1 to CntAllowedChars do
    Convert[AllowedChars[I]] := PredefinedBuckets[I];
end;

procedure ModifyConvert;
var
  NewBucketInd: Integer;
begin
  Inc(ModifyConvertCounter);
  if (ModifyConvertCounter and 3) = 3 then //every 4 times
    begin
      //swap buckets for two random symbols
      UndoType := 1;
      repeat
        UndoCharInd1 := 1 + Random(CntAllowedChars - 1); //any symbol except end of word
        UndoCharInd2 := 1 + Random(CntAllowedChars - 1); //any symbol except end of word
        UndoBucketInd1 := Convert[AllowedChars[UndoCharInd1]];
        UndoBucketInd2 := Convert[AllowedChars[UndoCharInd2]];
        Convert[AllowedChars[UndoCharInd1]] := UndoBucketInd2;
        Convert[AllowedChars[UndoCharInd2]] := UndoBucketInd1;
      until (UndoCharInd1 <> UndoCharInd2);
    end
  else if (ModifyConvertCounter and 3) = 1 then //every 4 times
    begin
      //delete random symbol
      UndoType := 2;
      UndoCharInd1 := 1 + Random(CntAllowedChars - 1); //any symbol except end of word
      UndoBucketInd1 := Convert[AllowedChars[UndoCharInd1]];
      Convert[AllowedChars[UndoCharInd1]] := 0;
    end
  else
    begin
      //change bucket for random symbol
      UndoType := 0;
      UndoCharInd1 := 1 + Random(CntAllowedChars);
      NewBucketInd := 1 + Random(MaxBucket);
      UndoBucketInd1 := Convert[AllowedChars[UndoCharInd1]];
      Convert[AllowedChars[UndoCharInd1]] := NewBucketInd;
    end;
end;

procedure ModifyConvertUndo;
begin
  case UndoType of
    0, 2:
      begin
        Convert[AllowedChars[UndoCharInd1]] := UndoBucketInd1;
      end;
    1:
      begin
        Convert[AllowedChars[UndoCharInd1]] := UndoBucketInd1;
        Convert[AllowedChars[UndoCharInd2]] := UndoBucketInd2;
      end;
  end;
end;

procedure WriteConvert(const ResStr: ShortString);
var
  F: TextFile;
  I, J: Integer;
  BucketStr: ShortString;
  SS: ShortString;
  B: array[1..CntAllowedChars] of Boolean;
begin
  BucketStr := '';
  for I := 1 to CntAllowedChars do
    B[I] := True;
  for J := 1 to MaxBucket do
    begin
      for I := 1 to CntAllowedChars do
        if Convert[AllowedChars[I]] = J then
          begin
            BucketStr := BucketStr + AllowedChars[I];
            B[I] := False;
          end;
      BucketStr := BucketStr + '  ';
    end;
  SS := '';
  for I := 1 to CntAllowedChars do
    if B[I] then
      SS := SS + AllowedChars[I];
  if SS <> '' then
    BucketStr := BucketStr + '--' + SS;
  WriteLn(BucketStr);

  Assign(F, FileOut);
  if FileExists(FileOut) then
    Append(F)
  else
    Rewrite(F);
  WriteLn(F);
  WriteLn(F, DateTimeToStr(Now));
  Write(F, '(', Convert[AllowedChars[1]]);
  for I := 2 to CntAllowedChars do
    Write(F, ', ', Convert[AllowedChars[I]]);
  WriteLn(F, ')');
  WriteLn(F, BucketStr);
  WriteLn(F, ResStr);
  CloseFile(F);
end;

function AddChar(var Dict: TDict; Rec: PRec; Bucket: Integer): PRec;
var
  J: Integer;
  PN: ^PRec;
begin
  PN := @Rec^.N[Bucket];
  if PN^ = nil then
    begin
      New(PN^);
      for J := 1 to MaxBucket do
        PN^^.N[J] := nil;
      PN^^.Weight := 1;
      Inc(Dict.NodeCount);
    end
  else
    Inc(PN^^.Weight);
  Result := PN^;
end;

procedure AddStr(var Dict: TDict; Rec: PRec; const S: ShortString);
var
  P: PRec;
  I, J: Integer;
  Len: Integer;
  Bucket: Integer;
begin
  Len := Length(S);
  J := 0;
  P := Rec;
  for I := 1 to Len do
    begin
      Bucket := Convert[S[I]];
      if Bucket <> 0 then
        begin
          P := AddChar(Dict, P, Bucket);

          Inc(J);
          if J >= MaxWordLen then
            Break;
        end;
    end;

  while J < MaxWordLen do
    begin
      P := AddChar(Dict, P, Convert['$']);
      Inc(J);
    end;
end;

function TestStr(Rec: PRec; const S: ShortString): Boolean;
var
  P: PRec;
  I, J: Integer;
  Len: Integer;
  Bucket: Integer;
begin
  Len := Length(S);
  J := 0;
  P := Rec;
  for I := 1 to Len do
    begin
      Bucket := Convert[S[I]];
      if Bucket <> 0 then
        begin
          P := P^.N[Bucket];
          if P = nil then
            begin
              Result := False;
              Exit;
            end;

          Inc(J);
          if J >= MaxWordLen then
            Break;
        end;
    end;

  while J < MaxWordLen do
    begin
      P := P^.N[Convert['$']];
      if P = nil then
        begin
          Result := False;
          Exit;
        end;
      Inc(J);
    end;
  Result := True;
end;

function FilterRecMinWeight(var Rec: PRec): LongInt;
var
  J: Integer;
  FilteredWeight: LongInt;
begin
  FilteredWeight := 0;
  for J := 1 to MaxBucket do
    begin
      if Rec^.N[J] <> nil then
        Inc(FilteredWeight, FilterRecMinWeight(Rec^.N[J]));
    end;

  Dec(Rec^.Weight, FilteredWeight);
  if Rec^.Weight < MinWeight then
    begin
      Result := Rec^.Weight + FilteredWeight;
      Dispose(Rec);
      Rec := nil;
    end
  else
    Result := FilteredWeight;
end;

function AddList(const List: TWordList; ListSize: LongInt): TDict;
var
  Dict: TDict;
  I: LongInt;
  J: Integer;
begin
  Dict.NodeCount := 1;
  New(Dict.Root);
  for J := 1 to MaxBucket do
    Dict.Root^.N[J] := nil;

  for I := 1 to ListSize do
    AddStr(Dict, Dict.Root, List[I]);

  Dict.Root^.Weight := 0;
  for J := 1 to MaxBucket do
    if Dict.Root^.N[J] <> nil then
      Inc(Dict.Root^.Weight, Dict.Root^.N[J]^.Weight);

  FilterRecMinWeight(Dict.Root);

  Result := Dict;
end;

procedure FreeRec(Rec: PRec);
var
  J: Integer;
  P: PRec;
begin
  for J := 1 to MaxBucket do
    begin
      P := Rec^.N[J];
      if P <> nil then
        FreeRec(P);
    end;
  Dispose(Rec);
end;

procedure FreeDict(var Dict: TDict);
begin
  FreeRec(Dict.Root);
  Dict.Root := nil;
  Dict.NodeCount := 0;
end;

procedure SaveDict(const Dict: TDict; const FName: String; BinMode: Boolean);
var
  F: TextFile;

  procedure WriteRecBin(NeedLevel, Level: Integer; Rec: PRec);
  var
    J: Integer;
    P: PRec;
  begin
    if Level < NeedLevel then
      begin
        for J := 1 to MaxBucket do
          begin
            P := Rec^.N[J];
            if P <> nil then
              WriteRecBin(NeedLevel, Level + 1, P);
          end;
      end
    else
      begin
        for J := 1 to MaxBucket do
          begin
            P := Rec^.N[J];
            if P <> nil then
              Write(F, #1)
            else
              Write(F, #0);
          end;
      end;
  end;

  procedure WriteRec(const Prefix: String; Rec: PRec);
  var
    J: Integer;
    P: PRec;
    Leaf: Boolean;
    C: Char;
  begin
    Leaf := True;
    for J := 1 to MaxBucket do
      begin
        P := Rec^.N[J];
        if P <> nil then
          begin
            C := Char(Byte('0') - 1 + J);
            WriteRec(Prefix + C, P);
            Leaf := False;
          end;
      end;
    if Leaf then
      WriteLn(F, Prefix);
  end;

var
  I: Integer;
begin
  AssignFile(F, FName);
  Rewrite(F);
  if BinMode then
    begin
      for I := 1 to CntAllowedChars do
        Write(F, Char(Convert[AllowedChars[I]]));
      for I := 1 to MaxWordLen do
        WriteRecBin(I, 1, Dict.Root)
    end
  else
    WriteRec('', Dict.Root);
  CloseFile(F);
end;

function DictBinSize(const Dict: TDict): LongInt;

  function BinSize(Level: Integer; Rec: PRec): LongInt;
  var
    J: Integer;
    P: PRec;
  begin
    Result := 1;

    if Level < MaxWordLen then
      for J := 1 to MaxBucket do
        begin
          P := Rec^.N[J];
          if P <> nil then
            Inc(Result, BinSize(Level + 1, P));
        end;
  end;

begin
  Result := BinSize(1, Dict.Root);
end;

function Percent(N1, N2: LongInt): ShortString;
begin
  Str(Round(10000.0 * N1 / N2) / 100 : 0 : 2, Result);
  Result := Result + '%';
end;

procedure ShowNodes(const Dict: TDict);
var
  DictSize: LongInt;
begin
  DictSize := DictBinSize(Dict);
  WriteLn('Node count = ', Dict.NodeCount, ' ', Percent(Dict.NodeCount, MaxNodeCount), ',  bin coded size = ', DictSize, ' items, ', (DictSize * MaxBucket +7) div 8, ' bytes');
  SaveDict(Dict, FileOutDict, True);
end;

function Test(const Dict: TDict; const ListTrue: TWordList; ListTrueSize: LongInt; const ListFalse: TWordList; ListFalseSize: LongInt; ResultPrev: LongInt): LongInt;
var
  I: LongInt;
  ExpCntTrue: LongInt;
  ExpCntFalse: LongInt;
  ResStr: ShortString;
begin
  ExpCntTrue := 0;
  ExpCntFalse := 0;

  for I := 1 to ListTrueSize do
    if TestStr(Dict.Root, ListTrue[I]) then
      Inc(ExpCntTrue);

  for I := 1 to ListFalseSize do
    if not TestStr(Dict.Root, ListFalse[I]) then
      Inc(ExpCntFalse);

  Result := ExpCntTrue + ExpCntFalse;
  if Result > ResultPrev then
    begin
      WriteLn;
      ShowNodes(Dict);
      ResStr :=
        IntToStr(ExpCntTrue) + ' / ' + IntToStr(ListTrueSize) + ' = ' + Percent(ExpCntTrue, ListTrueSize) + ',    ' +
        IntToStr(ExpCntFalse) + ' / ' + IntToStr(ListFalseSize) + ' = ' + Percent(ExpCntFalse, ListFalseSize) + ',    ' +
        'global: ' + Percent(ExpCntTrue + ExpCntFalse, ListTrueSize + ListFalseSize);
      WriteLn(ResStr);
      WriteConvert(ResStr);
    end
  else
    Write('.');
end;

procedure LoadWordList(const FName: ShortString; var List: TWordList; var ListSize: LongInt);
var
  I: LongInt;
  F: TextFile;
begin
  I := 1;
  AssignFile(F, FName);
  Reset(F);
  while not Eof(F) do
    begin
      ReadLn(F, List[I]);
      {$IFDEF PREPARE_STRING}
      PrepareString(List[I]);
      {$ENDIF}
      if Length(List[I]) <= DropWordLen then
        begin
          Inc(I);
          if I > MaxWordInList then
            Break;
        end;
    end;
  CloseFile(F);
  ListSize := I - 1;
end;

procedure Work;
var
  Dict: TDict;
  TestResult: LongInt;
  TestResultPrev: LongInt;
  Code1, Code2, Code3: Integer;
  J: Integer;
begin
  if ParamCount <> 5 then
    begin
      WriteLn('Need 5 parameters: MaxBucket, MaxWordLen, MinWeight, FileOut, FileOutDict');
      Exit;
    end;

  Val(ParamStr(1), MaxBucket, Code1);
  Val(ParamStr(2), MaxWordLen, Code2);
  Val(ParamStr(3), MinWeight, Code3);
  FileOut := ParamStr(4);
  FileOutDict := ParamStr(5);
  if (Code1 <> 0) or (Code2 <> 0) or (Code3 <> 0) then
    begin
      WriteLn('Parameters MaxBucket, MaxWordLen, MinWeight must be integers');
      Exit;
    end;

  if MaxBucket > 14 then
    begin
      WriteLn('Parameter MaxBucket must be <= 14');
      Exit;
    end;

  MaxNodeCount := 1;
  for J := 1 to MaxWordLen do
    MaxNodeCount := MaxNodeCount * MaxBucket;

  Randomize;
  PrepareConvert;
  LoadWordList(FileDictionary, ListDictionary, ListDictionarySize);
  LoadWordList(FileFalseTests, ListFalseTests, ListFalseTestsSize);

  Dict := AddList(ListDictionary, ListDictionarySize);
  TestResultPrev := Test(Dict, ListDictionary, ListDictionarySize, ListFalseTests, ListFalseTestsSize, MaxLongInt);

  while True do
    begin
      ModifyConvert;
      Dict := AddList(ListDictionary, ListDictionarySize);
      TestResult := Test(Dict, ListDictionary, ListDictionarySize, ListFalseTests, ListFalseTestsSize, TestResultPrev);
      if TestResult > TestResultPrev then
        TestResultPrev := TestResult
      else
        ModifyConvertUndo;
      FreeDict(Dict);
    end;
end;

begin
  Work;
end.
